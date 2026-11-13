'use client';

import axios from 'axios';
import { useEffect, useState, type FormEvent } from 'react';
import { permissionGroups, roles, type MemberRole, type Permission } from '@/app/api/access';
import { erpClient } from '@/app/api/erpClient';
import { useAccess } from '@/store/access';
import buttons from '@/assets/common/Button.module.scss';
import dataView from '@/assets/common/DataView.module.scss';
import forms from '@/assets/common/FormControls.module.scss';
import styles from '@/assets/dashboard/settings/Settings.module.scss';
import modal from '@/assets/modal/ModalParts.module.scss';
import ModalLayout from '@/components/modal/ModalLayout';
import { Icon } from '@/components/ui/Icon';

interface RolePolicy {
  role: MemberRole;
  permissions: Permission[];
  required: Permission[];
  version: number | null;
}

const path = '/api/settings/permissions';
const roleOrder = Object.keys(roles) as MemberRole[];

export function RolePermissions() {
  const { refreshAccess } = useAccess();
  const [policies, setPolicies] = useState<RolePolicy[] | null>(null);
  const [editor, setEditor] = useState<RolePolicy | null>(null);
  const [draft, setDraft] = useState<Permission[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    erpClient.get<RolePolicy[]>(path, { signal: controller.signal }).then(({ data }) => {
      if (!controller.signal.aborted) setPolicies(data);
    }).catch(() => {
      if (!controller.signal.aborted) setLoadError(true);
    });
    return () => controller.abort();
  }, [loadAttempt]);

  function reloadPolicies() {
    setPolicies(null);
    setLoadError(false);
    setLoadAttempt((current) => current + 1);
  }

  function editPolicy(policy: RolePolicy) {
    setEditor(policy);
    setDraft(policy.permissions);
    setError('');
    setConflict(false);
    setNotice('');
  }

  function togglePermission(permission: Permission, dependents: Permission[], checked: boolean) {
    setDraft((current) => checked
      ? [...current, permission]
      : current.filter((entry) => entry !== permission && !dependents.includes(entry)));
  }

  async function savePolicy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor || isSaving || conflict) return;
    setIsSaving(true);
    setError('');
    try {
      const { data } = await erpClient.put<RolePolicy>(`${path}/${editor.role}`, {
        permissions: draft,
        version: editor.version,
      });
      setPolicies((current) => current?.map((policy) => policy.role === data.role ? data : policy) ?? null);
      setEditor(null);
      setNotice(`${roles[data.role].label} 권한을 저장했습니다.`);
      refreshAccess();
    } catch (error) {
      const response = axios.isAxiosError<{ detail?: string }>(error) ? error.response : undefined;
      setConflict(response?.status === 409);
      setError(response?.data?.detail ?? '권한을 저장하지 못했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSaving(false);
    }
  }

  if (loadError) return (
    <>
      <p className={styles.formError} role="alert">권한 설정을 불러오지 못했습니다.</p>
      <button type="button" className={buttons.button} data-variant="outline" onClick={reloadPolicies}>다시 불러오기</button>
    </>
  );
  if (!policies) return <p role="status">권한 설정을 불러오는 중입니다.</p>;

  return (
    <>
      <ul className={styles.roleList}>
        {roleOrder.map((role) => {
          const policy = policies.find((entry) => entry.role === role);
          if (!policy) return null;
          const { label: roleLabel, tone, icon: roleIcon } = roles[role];

          return (
            <li key={role} className={styles.roleCard}>
              <div className={styles.roleHeader}>
                <span className={`${dataView.badge} ${styles.roleIcon}`} data-tone={tone}>
                  <Icon name={roleIcon} size={19} />
                </span>
                <strong>{roleLabel}</strong>
                <button
                  type="button"
                  className={buttons.button}
                  data-variant="outline"
                  data-size="small"
                  aria-label={`${roleLabel} 권한 설정`}
                  onClick={() => editPolicy(policy)}
                >
                  권한 설정
                </button>
              </div>
              {policy.permissions.length > 0 ? (
                <dl className={styles.roleGrants}>
                  {permissionGroups.map(({ label, icon, entries }) => {
                    const enabled = entries.filter(([permission]) => policy.permissions.includes(permission));
                    if (!enabled.length) return null;

                    return (
                      <div className={styles.grantRow} key={label}>
                        <dt><Icon name={icon} size={15} />{label}</dt>
                        <dd>
                          {enabled.map(([permission, action]) => (
                            <span key={permission} className={dataView.badge} data-tone={tone}>{action}</span>
                          ))}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              ) : <p className={styles.roleEmpty}>설정된 권한이 없습니다.</p>}
            </li>
          );
        })}
      </ul>
      {notice && <p className={styles.roleNotice} role="status">{notice}</p>}
      {editor && (
        <ModalLayout isOpen onClose={() => { if (!isSaving) setEditor(null); }} title={`${roles[editor.role].label} 권한 설정`}>
          <form onSubmit={savePolicy} aria-busy={isSaving}>
            <div className={styles.permissionGroups}>
              {permissionGroups.map(({ label, icon, entries }) => {
                const view = entries[0][0];
                const dependents = entries.slice(1).map(([permission]) => permission);
                return (
                  <fieldset key={label} className={styles.permissionGroup} disabled={isSaving}>
                    <legend><Icon name={icon} size={15} />{label}</legend>
                    <div className={styles.permissionOptions}>
                      {entries.map(([permission, action]) => {
                        const required = editor.required.includes(permission);
                        return (
                          <label key={permission} className={forms.checkboxLabel}>
                            <input
                              type="checkbox"
                              checked={draft.includes(permission)}
                              disabled={required || (permission !== view && !draft.includes(view))}
                              onChange={(event) => togglePermission(permission, permission === view ? dependents : [], event.target.checked)}
                            />
                            {action}{required && ' (필수)'}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              })}
            </div>
            {error && <p className={styles.formError} role="alert">{error}</p>}
            <div className={modal.actions}>
              <button type="button" className={buttons.button} data-variant="outline" disabled={isSaving} onClick={() => setEditor(null)}>취소</button>
              {conflict ? (
                <button type="button" className={buttons.button} onClick={() => {
                  setEditor(null);
                  reloadPolicies();
                }}>다시 불러오기</button>
              ) : (
                <button type="submit" className={buttons.button} disabled={isSaving}>{isSaving ? '저장 중…' : '저장'}</button>
              )}
            </div>
          </form>
        </ModalLayout>
      )}
    </>
  );
}
