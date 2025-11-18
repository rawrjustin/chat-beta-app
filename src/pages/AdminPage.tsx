import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  clearCharacterPasswordProtection,
  getAdminCharacters,
  setCharacterPasswordProtection,
} from '../utils/api';
import type { AdminCharactersResponse, CharacterResponse } from '../types/api';
import { LoadingSpinner } from '../components/LoadingSpinner';

const PASSWORD_STORAGE_KEY = 'chat-beta-admin-password';

interface PasswordRowState {
  isSaving: boolean;
  error: string | null;
  success: string | null;
}

export function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [password, setPassword] = useState<string>(() => {
    const queryPassword = searchParams.get('password');
    if (queryPassword) {
      return queryPassword;
    }
    if (typeof window !== 'undefined') {
      return localStorage.getItem(PASSWORD_STORAGE_KEY) || '';
    }
    return '';
  });
  const [data, setData] = useState<AdminCharactersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedConfigId, setCopiedConfigId] = useState<string | null>(null);
  const [passwordInputs, setPasswordInputs] = useState<Record<string, string>>({});
  const [passwordActionState, setPasswordActionState] = useState<
    Record<string, PasswordRowState>
  >({});

  const hasAttemptedInitialFetch = useRef(false);

  const fetchAdminData = useCallback(
    async (passwordToUse: string) => {
      if (!passwordToUse) {
        setError('Password is required');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const adminData = await getAdminCharacters(passwordToUse);
        setData(adminData);

        if (typeof window !== 'undefined') {
          localStorage.setItem(PASSWORD_STORAGE_KEY, passwordToUse);
        }

        setSearchParams((current) => {
          const next = new URLSearchParams(current);
          next.set('password', passwordToUse);
          return next;
        });
      } catch (err) {
        setData(null);
        setError(err instanceof Error ? err.message : 'Failed to load admin data');
      } finally {
        setIsLoading(false);
      }
    },
    [setSearchParams]
  );

  useEffect(() => {
    if (password) {
      return;
    }

    setData(null);
    setError(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem(PASSWORD_STORAGE_KEY);
    }

    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete('password');
      return next;
    });
  }, [password, setSearchParams]);

  useEffect(() => {
    if (hasAttemptedInitialFetch.current) {
      return;
    }
    if (!password) {
      return;
    }
    fetchAdminData(password);
    hasAttemptedInitialFetch.current = true;
  }, [fetchAdminData, password]);

  const shareBaseUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return window.location.origin;
  }, []);

  const sortedCharacters = useMemo(() => {
    if (!data?.characters) {
      return [];
    }

    return [...data.characters].sort(
      (a, b) =>
        (a.display_order ?? Number.MAX_SAFE_INTEGER) - (b.display_order ?? Number.MAX_SAFE_INTEGER)
    );
  }, [data]);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      fetchAdminData(password);
    },
    [fetchAdminData, password]
  );

  const handleCopyShareLink = useCallback(async (configId: string) => {
    if (!shareBaseUrl) return;
    const shareLink = `${shareBaseUrl}/chat/${configId}`;

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopiedConfigId(configId);
      setTimeout(() => setCopiedConfigId(null), 2000);
    } catch (err) {
      console.error('Failed to copy share link', err);
    }
  }, [shareBaseUrl]);

  const updatePasswordActionState = useCallback(
    (configId: string, partial: Partial<PasswordRowState>) => {
      setPasswordActionState((prev) => {
        const existing = prev[configId] ?? { isSaving: false, error: null, success: null };
        return {
          ...prev,
          [configId]: {
            ...existing,
            ...partial,
          },
        };
      });
    },
    []
  );

  const handlePasswordInputChange = useCallback(
    (configId: string, value: string) => {
      setPasswordInputs((prev) => ({
        ...prev,
        [configId]: value,
      }));
      updatePasswordActionState(configId, { error: null, success: null });
    },
    [updatePasswordActionState]
  );

  const handleApplyPassword = useCallback(
    async (configId: string, newPasswordValue: string) => {
      if (!password) {
        setError('Enter the admin password to manage character settings.');
        return;
      }

      const newPassword = newPasswordValue.trim();
      if (!newPassword) {
        updatePasswordActionState(configId, {
          error: 'Enter a password before saving.',
          success: null,
        });
        return;
      }

      updatePasswordActionState(configId, { isSaving: true, error: null, success: null });

      try {
        await setCharacterPasswordProtection(configId, password, newPassword);
        await fetchAdminData(password);
        setPasswordInputs((prev) => ({ ...prev, [configId]: '' }));
        updatePasswordActionState(configId, {
          isSaving: false,
          success: 'Password updated',
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to update password. Please try again.';
        updatePasswordActionState(configId, {
          isSaving: false,
          error: message,
        });
      }
    },
    [fetchAdminData, password, updatePasswordActionState]
  );

  const handleRemovePassword = useCallback(
    async (configId: string) => {
      if (!password) {
        setError('Enter the admin password to manage character settings.');
        return;
      }

      const confirmed =
        typeof window !== 'undefined'
          ? window.confirm('Remove the password requirement for this character?')
          : true;
      if (!confirmed) {
        return;
      }

      updatePasswordActionState(configId, { isSaving: true, error: null, success: null });

      try {
        await clearCharacterPasswordProtection(configId, password);
        await fetchAdminData(password);
        updatePasswordActionState(configId, {
          isSaving: false,
          success: 'Password removed',
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to remove password. Please try again.';
        updatePasswordActionState(configId, {
          isSaving: false,
          error: message,
        });
      }
    },
    [fetchAdminData, password, updatePasswordActionState]
  );

  const renderCharacterRow = (character: CharacterResponse) => {
    const statusLabel = character.hidden ? 'Hidden' : 'Visible';
    const statusStyles = character.hidden
      ? 'bg-red-100 text-red-800'
      : 'bg-green-100 text-green-800';
    const avatarUrl = character.avatar_url;
    const passwordInputValue = passwordInputs[character.config_id] ?? '';
    const passwordState = passwordActionState[character.config_id];
    const passwordStatusLabel = character.password_required ? 'Protected' : 'Not Protected';
    const passwordStatusStyles = character.password_required
      ? 'bg-yellow-100 text-yellow-800'
      : 'bg-gray-100 text-gray-700';
    const passwordUpdatedAtLabel = character.password_updated_at
      ? new Date(character.password_updated_at).toLocaleString()
      : null;

    return (
      <tr key={character.config_id} className="border-b border-gray-200">
        <td className="px-4 py-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={character.name || character.config_id}
              className="h-12 w-12 rounded object-cover bg-gray-100"
            />
          ) : (
            <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center text-gray-500">
              N/A
            </div>
          )}
        </td>
        <td className="px-4 py-3">
          <div className="font-medium text-gray-900">{character.name || 'Untitled Character'}</div>
          <div className="text-sm text-gray-500">
            {character.description || 'No description provided.'}
          </div>
        </td>
        <td className="px-4 py-3">
          <code className="text-xs bg-gray-100 rounded px-2 py-1 break-all">{character.config_id}</code>
        </td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles}`}>
            {statusLabel}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full font-medium ${passwordStatusStyles}`}
              >
                {passwordStatusLabel}
              </span>
              {passwordUpdatedAtLabel && (
                <span className="text-gray-500">Updated {passwordUpdatedAtLabel}</span>
              )}
            </div>
            {character.password_hint && (
              <p className="text-xs text-gray-500">Hint: {character.password_hint}</p>
            )}
            <div className="flex flex-col xl:flex-row gap-2">
              <input
                type="password"
                value={passwordInputValue}
                onChange={(event) =>
                  handlePasswordInputChange(character.config_id, event.target.value)
                }
                placeholder={
                  character.password_required ? 'Update password' : 'Set new password'
                }
                className="flex-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm text-gray-700"
                disabled={Boolean(passwordState?.isSaving) || isLoading}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyPassword(character.config_id, passwordInputValue)}
                  className="btn-secondary text-xs"
                  disabled={Boolean(passwordState?.isSaving) || isLoading}
                >
                  {character.password_required ? 'Update' : 'Set Password'}
                </button>
                {character.password_required && (
                  <button
                    type="button"
                    onClick={() => handleRemovePassword(character.config_id)}
                    className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                    disabled={Boolean(passwordState?.isSaving) || isLoading}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            {passwordState?.error && (
              <p className="text-xs text-red-600">{passwordState.error}</p>
            )}
            {passwordState?.success && (
              <p className="text-xs text-green-600">{passwordState.success}</p>
            )}
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={`${shareBaseUrl}/chat/${character.config_id}`}
              className="flex-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-sm text-gray-600"
            />
            <button
              type="button"
              onClick={() => handleCopyShareLink(character.config_id)}
              className="btn-secondary whitespace-nowrap"
            >
              {copiedConfigId === character.config_id ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            View all characters, including those hidden from the public API. Use the admin password to
            authenticate.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700">
                Admin Password
              </label>
              <input
                id="adminPassword"
                name="adminPassword"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter admin password"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                {isLoading ? 'Authenticating…' : 'Load Data'}
              </button>
              <button
                type="button"
                onClick={() => fetchAdminData(password)}
                className="btn-secondary"
                disabled={isLoading || !password}
              >
                Refresh
              </button>
            </div>
          </div>
          {error && (
            <p className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}
        </form>

        {isLoading && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-10 flex flex-col items-center justify-center text-gray-500">
            <LoadingSpinner />
            <p className="mt-4 text-sm">Loading admin data…</p>
          </div>
        )}

        {!isLoading && data && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard label="Total Characters" value={data.total} />
              <StatCard label="Visible Characters" value={data.visible} />
              <StatCard label="Hidden Characters" value={data.hidden} />
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">All Characters</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Includes hidden characters. You can set or remove chat passwords and share protected links from here.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avatar
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Character
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Config ID
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Password Protection
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Share Link
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedCharacters.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                          No characters found.
                        </td>
                      </tr>
                    ) : (
                      sortedCharacters.map((character) => renderCharacterRow(character))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !data && !error && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-sm text-gray-500">
            Enter the admin password to load character data.
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

