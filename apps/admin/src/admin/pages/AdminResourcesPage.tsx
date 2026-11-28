import React, { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  BookOpen, FileText, Video, Globe, ClipboardList, Search, Plus, Upload,
  Eye, RefreshCw, X, CheckCircle2, AlertCircle, Loader2,
} from 'lucide-react';

type ResourceType = 'document' | 'video' | 'website' | 'exercise';
type ResourceStatus = 'draft' | 'published';
type Resource = {
  id: string;
  subject_id: string;
  author_account_id: string;
  title: string;
  description: string;
  resource_url: string | null;
  storage_path: string | null;
  resource_type: ResourceType;
  status: ResourceStatus;
  created_at: string;
};
type Subject = { id: string; programme_id: string; name: string; code: string | null; active: boolean };
type Programme = { id: string; name: string; code: string; active: boolean };
type Catalogue = { subjects?: Subject[]; programmes?: Programme[] };
type ResourceForm = {
  subjectId: string;
  title: string;
  description: string;
  resourceType: 'video' | 'website' | 'exercise';
  resourceUrl: string;
};

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_ROOT = '/api/staff/academic';
const FILE_LIMIT = 8 * 1024 * 1024;
const FILE_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
].join(',');

function authHeaders(): HeadersInit {
  const token = sessionStorage.getItem('upec_admin_session');
  if (!token) throw new Error('Your staff session has expired. Please sign in again.');
  return { Authorization: 'Bearer ' + token };
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(authHeaders());
  new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(API_BASE + API_ROOT + path, { ...init, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'The resource request could not be completed.');
  return data as T;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(date);
}
function formatBytes(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '—';
  if (value < 1024 * 1024) return (value / 1024).toFixed(0) + ' KB';
  return (value / (1024 * 1024)).toFixed(1) + ' MB';
}
function typeLabel(type: ResourceType) {
  return ({ document: 'Document', video: 'Video', website: 'Website', exercise: 'Exercise' })[type];
}
function typeIcon(type: ResourceType) {
  if (type === 'video') return <Video size={16} />;
  if (type === 'website') return <Globe size={16} />;
  if (type === 'exercise') return <ClipboardList size={16} />;
  return <FileText size={16} />;
}

export default function AdminResourcesPage({ canPublish = false }: { canPublish?: boolean }) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [hasMoreResources, setHasMoreResources] = useState(false);
  const [loadingMoreResources, setLoadingMoreResources] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [programmeFilter, setProgrammeFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState<ResourceForm>({
    subjectId: '', title: '', description: '', resourceType: 'website', resourceUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploadStep, setUploadStep] = useState('');
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [statusBusyId, setStatusBusyId] = useState<string | null>(null);

  const load = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const [resourceData, catalogue] = await Promise.all([
        api<{ resources?: Resource[]; hasMore?: boolean }>('/resources'),
        api<Catalogue>('/catalogue'),
      ]);
      const nextResources = resourceData.resources || [];
      setResources(nextResources);
      setHasMoreResources(Boolean(resourceData.hasMore));
      setSubjects((catalogue.subjects || []).filter((item) => item.active));
      setProgrammes((catalogue.programmes || []).filter((item) => item.active));
      setSelectedId((current) => current && nextResources.some((item) => item.id === current)
        ? current
        : nextResources[0]?.id || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load learning resources.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const loadMoreResources = async () => {
    if (loadingMoreResources || !hasMoreResources) return;
    setLoadingMoreResources(true);
    setError('');
    try {
      const result = await api<{ resources?: Resource[]; hasMore?: boolean }>('/resources?offset=' + resources.length);
      const incoming = result.resources || [];
      setResources(current => {
        const known = new Set(current.map(item => item.id));
        return [...current, ...incoming.filter(item => !known.has(item.id))];
      });
      setHasMoreResources(Boolean(result.hasMore));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load more resources.');
    } finally {
      setLoadingMoreResources(false);
    }
  };

  const subjectMap = useMemo(() => new Map(subjects.map((item) => [item.id, item])), [subjects]);
  const programmeMap = useMemo(() => new Map(programmes.map((item) => [item.id, item])), [programmes]);
  const getProgramme = (resource: Resource) => {
    const subject = subjectMap.get(resource.subject_id);
    return subject ? programmeMap.get(subject.programme_id) : undefined;
  };
  const filtered = useMemo(() => resources.filter((resource) => {
    const subject = subjectMap.get(resource.subject_id);
    const programme = subject ? programmeMap.get(subject.programme_id) : undefined;
    const term = query.trim().toLowerCase();
    if (programmeFilter !== 'all' && programme?.id !== programmeFilter) return false;
    if (subjectFilter !== 'all' && resource.subject_id !== subjectFilter) return false;
    if (typeFilter !== 'all' && resource.resource_type !== typeFilter) return false;
    if (statusFilter !== 'all' && resource.status !== statusFilter) return false;
    if (term && ![resource.title, resource.description, subject?.name, programme?.name]
      .some((value) => (value || '').toLowerCase().includes(term))) return false;
    return true;
  }), [resources, subjectMap, programmeMap, query, programmeFilter, subjectFilter, typeFilter, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
  const selected = resources.find((item) => item.id === selectedId) || null;
  const publishedCount = resources.filter((item) => item.status === 'published').length;
  const draftCount = resources.length - publishedCount;
  const linkCount = resources.filter((item) => item.resource_type !== 'document').length;

  useEffect(() => { setPage(1); }, [query, programmeFilter, subjectFilter, typeFilter, statusFilter, pageSize]);

  useEffect(() => {
    if (selectedId && !filtered.some((resource) => resource.id === selectedId)) {
      setSelectedId(filtered[0]?.id || null);
    }
  }, [filtered, selectedId]);

  const notify = (message: string, kind: 'success' | 'error' = 'success') => {
    window.dispatchEvent(new CustomEvent('upec-admin-toast', { detail: { message, kind } }));
  };

  const resetUpload = () => {
    setUploadOpen(false);
    setEditingResource(null);
    setUploadMode('file');
    setFile(null);
    setForm({ subjectId: '', title: '', description: '', resourceType: 'website', resourceUrl: '' });
    setUploadStep('');
  };

  const submitResource = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    if (!form.subjectId) { setError('Choose the subject this resource belongs to.'); return; }
    if (!editingResource && uploadMode === 'file' && !file) { setError('Choose a file to upload.'); return; }
    if (uploadMode === 'file' && file && file.size > FILE_LIMIT) { setError('The selected file exceeds the 8 MB upload limit.'); return; }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      if (editingResource) {
        setUploadStep('Saving resource changes…');
        await api('/resources/' + encodeURIComponent(editingResource.id), {
          method: 'PATCH',
          body: JSON.stringify({
            subjectId: form.subjectId,
            title: form.title,
            description: form.description,
            resourceUrl: editingResource.storage_path ? undefined : form.resourceUrl,
            resourceType: editingResource.storage_path ? 'document' : form.resourceType,
          }),
        });
        notify('Resource details updated.');
      } else if (uploadMode === 'link') {
        setUploadStep('Saving resource link…');
        await api('/resources', {
          method: 'POST',
          body: JSON.stringify({
            subjectId: form.subjectId,
            title: form.title,
            description: form.description,
            resourceUrl: form.resourceUrl,
            resourceType: form.resourceType,
          }),
        });
      } else if (file) {
        setUploadStep('Preparing secure upload…');
        const initialized = await api<{ resourceId: string; uploadUrl: string; maxBytes: number }>('/resources/upload-init', {
          method: 'POST',
          body: JSON.stringify({
            subjectId: form.subjectId,
            title: form.title,
            description: form.description,
            mimeType: file.type,
            fileSize: file.size,
          }),
        });
        setUploadStep('Uploading ' + file.name + '…');
        const uploadResponse = await fetch(initialized.uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });
        if (!uploadResponse.ok) throw new Error('File transfer failed. The draft upload record may need attention; retry after refreshing.');
        setUploadStep('Verifying uploaded file…');
        await api('/resources/' + encodeURIComponent(initialized.resourceId) + '/upload-verify', { method: 'POST', body: JSON.stringify({}) });
      }
      resetUpload();
      if (!editingResource) notify('Learning resource saved as a draft. Review it before publishing.');
      await load(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save this resource.');
    } finally {
      setSaving(false);
      setUploadStep('');
    }
  };

  const changeStatus = async (resource: Resource) => {
    if (statusBusyId) return;
    const nextStatus: ResourceStatus = resource.status === 'published' ? 'draft' : 'published';
    if (nextStatus === 'published' && !window.confirm('Publish this resource? Approved students will be able to access it.')) return;
    setStatusBusyId(resource.id);
    setError('');
    try {
      await api('/resources/' + encodeURIComponent(resource.id) + '/status', {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      notify(nextStatus === 'published' ? 'Resource published for eligible students.' : 'Resource moved back to draft.');
      await load(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update resource status.');
    } finally {
      setStatusBusyId(null);
    }
  };

  const editResource = (resource: Resource) => {
    if (resource.status !== 'draft') {
      notify('Unpublish this resource before editing it.', 'error');
      return;
    }
    setError('');
    setEditingResource(resource);
    setUploadMode(resource.storage_path ? 'file' : 'link');
    setFile(null);
    setForm({
      subjectId: resource.subject_id,
      title: resource.title,
      description: resource.description || '',
      resourceType: resource.resource_type === 'document' ? 'website' : resource.resource_type,
      resourceUrl: resource.resource_url || '',
    });
    setUploadOpen(true);
  };

  const deleteResource = async (resource: Resource) => {
    if (resource.status !== 'draft') {
      notify('Unpublish this resource before deleting it.', 'error');
      return;
    }
    if (!window.confirm('Permanently delete "' + resource.title + '" and its stored file, if any? This cannot be undone.')) return;
    setDeletingId(resource.id);
    setError('');
    try {
      const result = await api<{ storageCleanupPending?: boolean }>('/resources/' + encodeURIComponent(resource.id), { method: 'DELETE' });
      setSelectedId(current => current === resource.id ? null : current);
      notify(result.storageCleanupPending
        ? 'Draft deleted, but its stored file needs administrator cleanup.'
        : 'Draft resource deleted.', result.storageCleanupPending ? 'error' : 'success');
      await load(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete this resource.');
    } finally {
      setDeletingId(null);
    }
  };

  const openResource = async (resource: Resource) => {
    // Open the tab synchronously from the click so popup blockers do not reject
    // the signed URL navigation after the API request completes.
    const popup = window.open('about:blank', '_blank');
    if (popup) popup.opener = null;
    setOpeningId(resource.id);
    setError('');
    try {
      const result = await api<{ url: string }>('/resources/' + encodeURIComponent(resource.id) + '/open');
      if (!popup) throw new Error('Your browser blocked the new tab. Allow pop-ups for this site and try again.');
      popup.location.href = result.url;
    } catch (err) {
      popup?.close();
      setError(err instanceof Error ? err.message : 'Unable to open this resource.');
    } finally {
      setOpeningId(null);
    }
  };

  const activeSubject = selected ? subjectMap.get(selected.subject_id) : undefined;
  const activeProgramme = selected ? getProgramme(selected) : undefined;

  return (
    <div className="min-w-0 space-y-4 sm:space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-[#111A43] sm:text-2xl">Learning Resources</h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">Manage study materials and publish verified resources to approved students.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => void load(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
          <button type="button" onClick={() => { setError(''); setUploadOpen(true); }} className="inline-flex items-center gap-2 rounded-xl bg-[#C62839] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#ad2030]">
            <Plus size={15} /> Upload Resource
          </button>
        </div>
      </header>

      {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><AlertCircle size={17} className="mt-0.5 shrink-0" /> <span>{error}</span></div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</div>}

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { label: 'Total resources', value: resources.length, icon: <BookOpen size={18} />, tone: 'bg-[#111A43]' },
          { label: 'Published', value: publishedCount, icon: <CheckCircle2 size={18} />, tone: 'bg-emerald-600' },
          { label: 'Drafts', value: draftCount, icon: <FileText size={18} />, tone: 'bg-amber-500' },
          { label: 'External resources', value: linkCount, icon: <Globe size={18} />, tone: 'bg-blue-600' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className={'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ' + item.tone}>{item.icon}</div>
            <div><p className="text-xl font-black leading-none text-[#111A43]">{item.value}</p><p className="mt-1 text-[11px] font-semibold text-slate-500">{item.label}</p></div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-5">
          <label className="relative xl:col-span-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search resources…" className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-[#111A43]" />
          </label>
          <select value={programmeFilter} onChange={(event) => { setProgrammeFilter(event.target.value); setSubjectFilter('all'); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700">
            <option value="all">All programmes</option>
            {programmes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700">
            <option value="all">All subjects</option>
            {subjects.filter((item) => programmeFilter === 'all' || item.programme_id === programmeFilter).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700">
            <option value="all">All resource types</option>
            <option value="document">Documents</option><option value="video">Videos</option><option value="website">Websites</option><option value="exercise">Exercises</option>
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-700">
            <option value="all">All statuses</option><option value="published">Published</option><option value="draft">Drafts</option>
          </select>
        </div>
      </section>

      <section className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-12">
        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-8">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div><h2 className="text-sm font-bold text-[#111A43]">Resource library</h2><p className="mt-0.5 text-[11px] text-slate-500">{filtered.length} matching records</p></div>
            <span className="text-[11px] text-slate-400">Live records</span>
          </div>
          {loading ? (
            <div className="space-y-3 p-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-12 animate-pulse rounded-lg bg-slate-100" />)}</div>
          ) : pageItems.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <BookOpen size={28} className="mx-auto text-slate-300" />
              <h3 className="mt-3 text-sm font-bold text-slate-700">{resources.length ? 'No matching resources' : 'Your resource library is empty'}</h3>
              <p className="mt-1 text-xs text-slate-500">{resources.length ? 'No resources match the current search and filters. Clear them to see the full library.' : 'Add a study document, video lecture, website or exercise to get started.'}</p>
              {resources.length ? (
                <button type="button" onClick={() => { setQuery(''); setProgrammeFilter('all'); setSubjectFilter('all'); setTypeFilter('all'); setStatusFilter('all'); }} className="mt-3 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#111A43] hover:bg-slate-50">Clear all filters</button>
              ) : (
                <button type="button" onClick={() => { setError(''); setUploadOpen(true); }} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[#C62839] px-3 py-2 text-xs font-bold text-white hover:bg-[#ad2030]"><Plus size={13} /> Upload first resource</button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-3">Resource</th><th className="px-3 py-3">Subject / Programme</th><th className="px-3 py-3">Type</th><th className="px-3 py-3">Created</th><th className="px-3 py-3">Status</th><th className="px-3 py-3 text-right">Action</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {pageItems.map((resource) => {
                      const subject = subjectMap.get(resource.subject_id);
                      const programme = getProgramme(resource);
                      const isSelected = selectedId === resource.id;
                      return (
                        <tr key={resource.id} onClick={() => setSelectedId(resource.id)} className={'cursor-pointer transition-colors ' + (isSelected ? 'bg-rose-50/60' : 'hover:bg-slate-50')}>
                          <td className="max-w-[260px] px-3 py-3"><div className="flex items-start gap-2"><span className="mt-0.5 text-[#111A43]">{typeIcon(resource.resource_type)}</span><div className="min-w-0"><p className="truncate font-semibold text-[#111A43]">{resource.title}</p><p className="mt-0.5 truncate text-[10px] text-slate-500">{resource.description || 'No description provided'}</p></div></div></td>
                          <td className="px-3 py-3"><p className="font-semibold text-slate-700">{subject?.name || 'Subject unavailable'}</p><p className="mt-0.5 text-[10px] text-slate-500">{programme?.name || 'Programme unavailable'}</p></td>
                          <td className="px-3 py-3 text-slate-600">{typeLabel(resource.resource_type)}</td>
                          <td className="whitespace-nowrap px-3 py-3 text-slate-500">{formatDate(resource.created_at)}</td>
                          <td className="px-3 py-3"><span className={'rounded-full px-2 py-1 text-[10px] font-bold ' + (resource.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700')}>{resource.status === 'published' ? 'Published' : 'Draft'}</span></td>
                          <td className="px-3 py-3 text-right">{canPublish && <button type="button" disabled={statusBusyId === resource.id} onClick={(event) => { event.stopPropagation(); void changeStatus(resource); }} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">{statusBusyId === resource.id ? 'Saving…' : resource.status === 'published' ? 'Unpublish' : 'Publish'}</button>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-2 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <span>Showing {filtered.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} loaded resources{hasMoreResources ? ' · more available' : ''}</span>
                <div className="flex items-center gap-2"><select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} className="rounded border border-slate-200 bg-white px-2 py-1.5"><option value={15}>15 per page</option><option value={30}>30 per page</option><option value={50}>50 per page</option></select><button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded border border-slate-200 px-3 py-1.5 disabled:opacity-40">Previous</button><span>Page {page} of {pageCount}</span><button type="button" disabled={page >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="rounded border border-slate-200 px-3 py-1.5 disabled:opacity-40">Next</button></div>
              </div>
              {hasMoreResources && <div className="flex justify-center border-t border-slate-100 p-3"><button type="button" onClick={() => void loadMoreResources()} disabled={loadingMoreResources} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-[#111A43] disabled:opacity-50">{loadingMoreResources ? 'Loading resources…' : 'Load more resources'}</button></div>}
            </>
          )}
        </div>

        <aside className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-4">
          <div className="flex items-center justify-between"><h2 className="text-sm font-bold text-[#111A43]">Resource details</h2>{selected && <button type="button" onClick={() => setSelectedId(null)} aria-label="Clear selection" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X size={15} /></button>}</div>
          {!selected ? <div className="py-12 text-center text-xs text-slate-500">Select a resource to inspect its details.</div> : (
            <div className="mt-4 space-y-4">
              <div className="flex h-32 items-center justify-center rounded-xl bg-[#111A43] text-white"><div className="text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#D5A75B]">{typeIcon(selected.resource_type)}</div><p className="mt-2 text-xs font-bold">{typeLabel(selected.resource_type)}</p><p className="mt-1 max-w-[220px] truncate text-[10px] text-slate-300">{selected.storage_path ? selected.storage_path.split('/').pop() : selected.resource_url}</p></div></div>
              <div><h3 className="break-words text-sm font-bold text-[#111A43]">{selected.title}</h3><p className="mt-1 text-xs leading-relaxed text-slate-500">{selected.description || 'No description provided.'}</p></div>
              <dl className="grid grid-cols-2 gap-3 border-y border-slate-100 py-3 text-xs">
                <div><dt className="text-[10px] text-slate-400">Subject</dt><dd className="mt-0.5 font-semibold text-slate-700">{activeSubject?.name || 'Unavailable'}</dd></div>
                <div><dt className="text-[10px] text-slate-400">Programme</dt><dd className="mt-0.5 font-semibold text-slate-700">{activeProgramme?.name || 'Unavailable'}</dd></div>
                <div><dt className="text-[10px] text-slate-400">Uploaded</dt><dd className="mt-0.5 font-semibold text-slate-700">{formatDate(selected.created_at)}</dd></div>
                <div><dt className="text-[10px] text-slate-400">Status</dt><dd className="mt-0.5 font-semibold capitalize text-slate-700">{selected.status}</dd></div>
                <div className="col-span-2"><dt className="text-[10px] text-slate-400">Contributor account</dt><dd className="mt-0.5 break-all font-mono text-[10px] text-slate-600">{selected.author_account_id}</dd></div>
              </dl>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => editResource(selected)} disabled={selected.status !== 'draft' || saving} className="rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 disabled:opacity-40">Edit details</button>
                <button type="button" onClick={() => void deleteResource(selected)} disabled={selected.status !== 'draft' || deletingId === selected.id} className="rounded-lg border border-rose-200 px-3 py-2.5 text-xs font-bold text-rose-700 disabled:opacity-40">{deletingId === selected.id ? 'Deleting…' : 'Delete draft'}</button>
                <button type="button" onClick={() => void openResource(selected)} disabled={openingId === selected.id} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#111A43] px-3 py-2.5 text-xs font-bold text-white hover:bg-[#1b285c] disabled:opacity-50">{openingId === selected.id ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />} Open resource</button>
                {canPublish && <button type="button" onClick={() => void changeStatus(selected)} disabled={statusBusyId === selected.id} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">{selected.status === 'published' ? 'Unpublish' : 'Publish'}</button>}
              </div>
              <p className="text-[10px] leading-relaxed text-slate-400">Only drafts can be edited or deleted. Unpublish a resource before changing its details. Download counts and storage analytics are not currently exposed by the backend, so they are intentionally not displayed as fabricated figures.</p>
            </div>
          )}
        </aside>
      </section>

      {uploadOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) resetUpload(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="resource-upload-title" className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-5"><div><h2 id="resource-upload-title" className="text-lg font-bold text-[#111A43]">{editingResource ? 'Edit learning resource' : 'Add learning resource'}</h2><p className="mt-1 text-xs text-slate-500">{editingResource ? 'Update draft details. Uploaded files cannot be replaced here.' : 'New resources are saved as drafts and require review before publication.'}</p></div><button type="button" disabled={saving} onClick={resetUpload} aria-label="Close upload dialog" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-40"><X size={18} /></button></div>
            <form onSubmit={submitResource} className="space-y-4 p-5">
              {!editingResource && <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => setUploadMode('file')} className={'rounded-lg px-3 py-2 text-xs font-bold ' + (uploadMode === 'file' ? 'bg-white text-[#111A43] shadow-sm' : 'text-slate-500')}>Upload a file</button><button type="button" onClick={() => setUploadMode('link')} className={'rounded-lg px-3 py-2 text-xs font-bold ' + (uploadMode === 'link' ? 'bg-white text-[#111A43] shadow-sm' : 'text-slate-500')}>Add a link</button></div>}
              <label className="block text-xs font-semibold text-slate-700">Subject<select required value={form.subjectId} onChange={(event) => setForm((value) => ({ ...value, subjectId: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="">Choose subject</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name} — {programmeMap.get(subject.programme_id)?.name || 'Programme'}</option>)}</select></label>
              <label className="block text-xs font-semibold text-slate-700">Resource title<input required minLength={5} maxLength={180} value={form.title} onChange={(event) => setForm((value) => ({ ...value, title: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" placeholder="e.g. Introduction to Mechanics" /></label>
              <label className="block text-xs font-semibold text-slate-700">Description<textarea maxLength={3000} rows={3} value={form.description} onChange={(event) => setForm((value) => ({ ...value, description: event.target.value }))} className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm" placeholder="Briefly describe what students will learn…" /></label>
              {uploadMode === 'file' && !editingResource ? (
                <div><label className="block text-xs font-semibold text-slate-700">Choose file <input required type="file" accept={FILE_TYPES} onChange={(event) => setFile(event.target.files?.[0] || null)} className="mt-1.5 block w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-xs file:mr-3 file:rounded-md file:border-0 file:bg-[#111A43] file:px-3 file:py-2 file:text-xs file:font-bold file:text-white" /></label><p className="mt-1.5 text-[11px] text-slate-500">PDF, PNG, JPG, DOCX or PPTX. Maximum size: 8 MB. {file ? 'Selected: ' + file.name + ' (' + formatBytes(file.size) + ')' : ''}</p></div>
              ) : uploadMode === 'link' ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label className="block text-xs font-semibold text-slate-700">Link type<select value={form.resourceType} onChange={(event) => setForm((value) => ({ ...value, resourceType: event.target.value as ResourceForm['resourceType'] }))} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="website">Website / reference</option><option value="video">Video lecture</option><option value="exercise">Online exercise</option></select></label><label className="block text-xs font-semibold text-slate-700">HTTPS resource URL<input required type="url" value={form.resourceUrl} onChange={(event) => setForm((value) => ({ ...value, resourceUrl: event.target.value }))} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" placeholder="https://…" /></label></div>
              ) : <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">The uploaded file will remain unchanged. You can update its title, description and subject.</p>}
              {uploadStep && <div role="status" className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-xs font-semibold text-blue-800"><Loader2 size={15} className="animate-spin" />{uploadStep}</div>}
              {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs text-rose-800">{error}</p>}
              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end"><button type="button" disabled={saving} onClick={resetUpload} className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 disabled:opacity-50">Cancel</button><button type="submit" disabled={saving || subjects.length === 0} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C62839] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50">{saving ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}{saving ? 'Saving…' : editingResource ? 'Save changes' : 'Save as draft'}</button></div>
              {subjects.length === 0 && <p className="text-[11px] text-amber-700">No active subjects are available. Add or activate a subject in Academic Management first.</p>}
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
