import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/MongoAuthContext';

const DEFAULT_STATS = {
  totalUsers: 0,
  totalTechnicians: 0,
  activeServices: 0,
  pendingApprovals: 0,
  totalRevenue: 0,
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const paramsKey = useMemo(() => searchParams.toString(), [searchParams]);

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentServices, setRecentServices] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [userQuery, setUserQuery] = useState({
    page: 1,
    limit: 10,
    search: '',
    role: 'all',
    status: 'all',
  });
  const [userSearchInput, setUserSearchInput] = useState('');
  const [usersState, setUsersState] = useState({
    data: [],
    loading: false,
    error: null,
    pagination: { page: 1, limit: 10, totalPages: 1, totalItems: 0 },
  });
  const [userActionId, setUserActionId] = useState(null);
  const [technicianQuery, setTechnicianQuery] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: 'all',
    kyc: 'all',
  });
  const [technicianSearchInput, setTechnicianSearchInput] = useState('');
  const [techniciansState, setTechniciansState] = useState({
    data: [],
    loading: false,
    error: null,
    pagination: { page: 1, limit: 10, totalPages: 1, totalItems: 0 },
  });
  const [technicianActionId, setTechnicianActionId] = useState(null);
  const [userDetailState, setUserDetailState] = useState({
    open: false,
    loading: false,
    data: null,
    error: null,
  });
  const [servicesState, setServicesState] = useState({
    data: [],
    loading: false,
    error: null,
    pagination: { page: 1, limit: 10, totalPages: 1, totalItems: 0 },
  });
  const [serviceQuery, setServiceQuery] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: 'all',
    category: 'all',
    priority: 'all',
  });
  const [serviceSearchInput, setServiceSearchInput] = useState('');
  const [serviceActionId, setServiceActionId] = useState(null);
  const [approvalsState, setApprovalsState] = useState({
    data: [],
    loading: false,
    error: null,
    pagination: { page: 1, limit: 10, totalPages: 1, totalItems: 0 },
  });
  const [approvalsQuery, setApprovalsQuery] = useState({
    page: 1,
    limit: 10,
    search: '',
  });
  const [approvalsSearchInput, setApprovalsSearchInput] = useState('');
  const [reportsState, setReportsState] = useState({
    data: null,
    loading: false,
    error: null,
  });
  const [reportsQuery, setReportsQuery] = useState({
    months: 6,
  });
  const [settingsState, setSettingsState] = useState({
    data: [],
    loading: false,
    error: null,
    saving: false,
  });
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState(null);
  const [profileDialog, setProfileDialog] = useState({
    open: false,
    loading: false,
    error: null,
    technician: null,
    details: null,
    recentServices: [],
  });

  const currentAdminId = user?._id || user?.id || null;
  const serviceCategories = useMemo(() => {
    const set = new Set();
    servicesState.data.forEach((service) => {
      if (service.category) set.add(service.category);
    });
    return Array.from(set);
  }, [servicesState.data]);

  const fetchAdminUsers = useCallback(
    async ({ signal } = {}) => {
      setUsersState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const params = {
          page: userQuery.page,
          limit: userQuery.limit,
        };

        if (userQuery.search.trim()) {
          params.search = userQuery.search.trim();
        }

        if (userQuery.role !== 'all') {
          params.role = userQuery.role;
        }

        if (userQuery.status !== 'all') {
          params.status = userQuery.status;
        }

        const { data } = await axios.get('/api/admin/users', {
          params,
          signal,
        });

        setUsersState({
          data: data?.data || [],
          loading: false,
          error: null,
          pagination: {
            page: data?.pagination?.page ?? userQuery.page,
            limit: data?.pagination?.limit ?? userQuery.limit,
            totalPages: data?.pagination?.totalPages ?? 1,
            totalItems: data?.pagination?.totalItems ?? 0,
          },
        });
      } catch (err) {
        if (axios.isCancel?.(err) || err?.code === 'ERR_CANCELED') {
          return;
        }
        console.error('Failed to load users', err);
        setUsersState((prev) => ({
          ...prev,
          loading: false,
          error: err?.response?.data?.error || 'Failed to load users.',
        }));
      }
    },
    [userQuery.page, userQuery.limit, userQuery.role, userQuery.status, userQuery.search]
  );

  const fetchAdminTechnicians = useCallback(
    async ({ signal } = {}) => {
      setTechniciansState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const params = {
          page: technicianQuery.page,
          limit: technicianQuery.limit,
        };

        if (technicianQuery.search.trim()) {
          params.search = technicianQuery.search.trim();
        }
        if (technicianQuery.status !== 'all') {
          params.status = technicianQuery.status;
        }
        if (technicianQuery.kyc !== 'all') {
          params.kyc = technicianQuery.kyc;
        }

        const { data } = await axios.get('/api/admin/technicians', {
          params,
          signal,
        });

        setTechniciansState({
          data: data?.data || [],
          loading: false,
          error: null,
          pagination: {
            page: data?.pagination?.page ?? technicianQuery.page,
            limit: data?.pagination?.limit ?? technicianQuery.limit,
            totalPages: data?.pagination?.totalPages ?? 1,
            totalItems: data?.pagination?.totalItems ?? 0,
          },
        });
      } catch (err) {
        if (axios.isCancel?.(err) || err?.code === 'ERR_CANCELED') {
          return;
        }
        console.error('Failed to load technicians', err);
        setTechniciansState((prev) => ({
          ...prev,
          loading: false,
          error: err?.response?.data?.error || 'Failed to load technicians.',
        }));
      }
    },
    [technicianQuery.page, technicianQuery.limit, technicianQuery.status, technicianQuery.kyc, technicianQuery.search]
  );

  const fetchAdminServices = useCallback(
    async ({ signal } = {}) => {
      setServicesState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const params = {
          page: serviceQuery.page,
          limit: serviceQuery.limit,
        };

        if (serviceQuery.search.trim()) {
          params.search = serviceQuery.search.trim();
        }
        if (serviceQuery.status !== 'all') {
          params.status = serviceQuery.status;
        }
        if (serviceQuery.category !== 'all') {
          params.category = serviceQuery.category;
        }
        if (serviceQuery.priority !== 'all') {
          params.priority = serviceQuery.priority;
        }

        const { data } = await axios.get('/api/admin/services', {
          params,
          signal,
        });

        setServicesState({
          data: data?.data || [],
          loading: false,
          error: null,
          pagination: {
            page: data?.pagination?.page ?? serviceQuery.page,
            limit: data?.pagination?.limit ?? serviceQuery.limit,
            totalPages: data?.pagination?.totalPages ?? 1,
            totalItems: data?.pagination?.totalItems ?? 0,
          },
        });
      } catch (err) {
        if (axios.isCancel?.(err) || err?.code === 'ERR_CANCELED') {
          return;
        }
        console.error('Failed to load services', err);
        setServicesState((prev) => ({
          ...prev,
          loading: false,
          error: err?.response?.data?.error || 'Failed to load services.',
        }));
      }
    },
    [
      serviceQuery.page,
      serviceQuery.limit,
      serviceQuery.status,
      serviceQuery.category,
      serviceQuery.priority,
      serviceQuery.search,
    ]
  );

  const fetchAdminApprovals = useCallback(
    async ({ signal } = {}) => {
      setApprovalsState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const params = {
          page: approvalsQuery.page,
          limit: approvalsQuery.limit,
        };

        if (approvalsQuery.search.trim()) {
          params.search = approvalsQuery.search.trim();
        }

        const { data } = await axios.get('/api/admin/approvals', {
          params,
          signal,
        });

        setApprovalsState({
          data: data?.data || [],
          loading: false,
          error: null,
          pagination: {
            page: data?.pagination?.page ?? approvalsQuery.page,
            limit: data?.pagination?.limit ?? approvalsQuery.limit,
            totalPages: data?.pagination?.totalPages ?? 1,
            totalItems: data?.pagination?.totalItems ?? 0,
          },
        });
      } catch (err) {
        if (axios.isCancel?.(err) || err?.code === 'ERR_CANCELED') {
          return;
        }
        console.error('Failed to load approvals', err);
        setApprovalsState((prev) => ({
          ...prev,
          loading: false,
          error: err?.response?.data?.error || 'Failed to load approvals.',
        }));
      }
    },
    [approvalsQuery.page, approvalsQuery.limit, approvalsQuery.search]
  );

  const fetchAdminReports = useCallback(
    async ({ signal } = {}) => {
      setReportsState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const { data } = await axios.get('/api/admin/reports', {
          params: { months: reportsQuery.months },
          signal,
        });
        setReportsState({
          data,
          loading: false,
          error: null,
        });
      } catch (err) {
        if (axios.isCancel?.(err) || err?.code === 'ERR_CANCELED') {
          return;
        }
        console.error('Failed to load reports', err);
        setReportsState((prev) => ({
          ...prev,
          loading: false,
          error: err?.response?.data?.error || 'Failed to load analytics reports.',
        }));
      }
    },
    [reportsQuery.months]
  );

  const fetchAdminSettings = useCallback(
    async ({ signal } = {}) => {
      setSettingsState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const { data } = await axios.get('/api/admin/settings', { signal });
        setSettingsState({
          data: data?.settings || [],
          loading: false,
          error: null,
          saving: false,
        });
      } catch (err) {
        if (axios.isCancel?.(err) || err?.code === 'ERR_CANCELED') {
          return;
        }
        console.error('Failed to load settings', err);
        setSettingsState((prev) => ({
          ...prev,
          loading: false,
          error: err?.response?.data?.error || 'Failed to load admin settings.',
        }));
      }
    },
    []
  );

  useEffect(() => {
    const tab = searchParams.get('tab') || 'overview';
    setActiveTab(tab);
  }, [searchParams]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get('/api/dashboard/admin');
        setStats(data?.stats || DEFAULT_STATS);
        setRecentUsers(data?.recentUsers || []);
        setRecentServices(data?.recentServices || []);
        setPendingApprovals(data?.pendingApprovals || []);
      } catch (err) {
        console.error('Failed to load admin dashboard', err);
        setError(err?.response?.data?.error || 'Unable to load admin dashboard right now.');
        setStats(DEFAULT_STATS);
        setRecentUsers([]);
        setRecentServices([]);
        setPendingApprovals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  useEffect(() => {
    if (activeTab !== 'users') return;
    const controller = new AbortController();
    fetchAdminUsers({ signal: controller.signal });
    return () => controller.abort();
  }, [activeTab, fetchAdminUsers]);

  useEffect(() => {
    setUserSearchInput(userQuery.search);
  }, [userQuery.search]);

  useEffect(() => {
    if (activeTab !== 'users') {
      setUserDetailState((prev) =>
        prev.open ? { open: false, loading: false, data: null, error: null } : prev
      );
      return;
    }

    const userIdParam = searchParams.get('id');
    if (!userIdParam) {
      setUserDetailState((prev) =>
        prev.open ? { open: false, loading: false, data: null, error: null } : prev
      );
      return;
    }

    const controller = new AbortController();
    setUserDetailState({ open: true, loading: true, data: null, error: null });

    axios
      .get(`/api/admin/users/${userIdParam}`, { signal: controller.signal })
      .then(({ data }) => {
        setUserDetailState({ open: true, loading: false, data, error: null });
      })
      .catch((err) => {
        if (axios.isCancel?.(err) || err?.code === 'ERR_CANCELED') return;
        setUserDetailState({
          open: true,
          loading: false,
          data: null,
          error: err?.response?.data?.error || 'Failed to load user details.',
        });
      });

    return () => controller.abort();
  }, [activeTab, paramsKey]);

  useEffect(() => {
    if (activeTab !== 'technicians') return;
    const controller = new AbortController();
    fetchAdminTechnicians({ signal: controller.signal });
    return () => controller.abort();
  }, [activeTab, fetchAdminTechnicians]);

  useEffect(() => {
    setTechnicianSearchInput(technicianQuery.search);
  }, [technicianQuery.search]);

  useEffect(() => {
    if (activeTab !== 'services') return;
    const controller = new AbortController();
    fetchAdminServices({ signal: controller.signal });
    return () => controller.abort();
  }, [activeTab, fetchAdminServices]);

  useEffect(() => {
    setServiceSearchInput(serviceQuery.search);
  }, [serviceQuery.search]);

  useEffect(() => {
    if (activeTab !== 'approvals') return;
    const controller = new AbortController();
    fetchAdminApprovals({ signal: controller.signal });
    return () => controller.abort();
  }, [activeTab, fetchAdminApprovals]);

  useEffect(() => {
    setApprovalsSearchInput(approvalsQuery.search);
  }, [approvalsQuery.search]);

  useEffect(() => {
    if (activeTab !== 'reports') return;
    const controller = new AbortController();
    fetchAdminReports({ signal: controller.signal });
    return () => controller.abort();
  }, [activeTab, fetchAdminReports]);

  useEffect(() => {
    if (activeTab !== 'settings') return;
    const controller = new AbortController();
    fetchAdminSettings({ signal: controller.signal });
    return () => controller.abort();
  }, [activeTab, fetchAdminSettings]);

  const handleUsersSearchInputChange = (event) => {
    setUserSearchInput(event.target.value);
  };

  const handleUsersSearchSubmit = (event) => {
    event.preventDefault();
    setUserQuery((prev) => ({
      ...prev,
      page: 1,
      search: userSearchInput.trim(),
    }));
  };

  const handleUsersRoleChange = (value) => {
    setUserQuery((prev) => ({
      ...prev,
      page: 1,
      role: value,
    }));
  };

  const handleUsersStatusChange = (value) => {
    setUserQuery((prev) => ({
      ...prev,
      page: 1,
      status: value,
    }));
  };

  const handleUsersPageChange = (newPage) => {
    setUserQuery((prev) => {
      const totalPages = Math.max(1, usersState.pagination.totalPages || 1);
      const safePage = Math.min(Math.max(newPage, 1), totalPages);
      if (safePage === prev.page) {
        return prev;
      }
      return {
        ...prev,
        page: safePage,
      };
    });
  };

  const handleUsersClearFilters = () => {
    setUserSearchInput('');
    setUserQuery((prev) => ({
      ...prev,
      page: 1,
      search: '',
      role: 'all',
      status: 'all',
    }));
  };

  const handleUsersRefresh = () => {
    fetchAdminUsers();
  };

  const handleUserStatusToggle = async (targetUser) => {
    if (!targetUser) return;
    const nextActive = targetUser.status !== 'active';
    setUserActionId(targetUser.id);
    try {
      const { data } = await axios.patch(`/api/admin/users/${targetUser.id}`, {
        isActive: nextActive,
      });

      const updated = data?.user;
      if (updated) {
        setUsersState((prev) => ({
          ...prev,
          data: prev.data.map((item) => (item.id === targetUser.id ? { ...item, ...updated } : item)),
        }));
      }
    } catch (err) {
      console.error('Failed to update user status', err);
      alert(err?.response?.data?.error || 'Failed to update user.');
    } finally {
      setUserActionId(null);
    }
  };

  const handleTechniciansSearchInputChange = (event) => {
    setTechnicianSearchInput(event.target.value);
  };

  const handleTechniciansSearchSubmit = (event) => {
    event.preventDefault();
    setTechnicianQuery((prev) => ({
      ...prev,
      page: 1,
      search: technicianSearchInput.trim(),
    }));
  };

  const handleTechniciansStatusChange = (value) => {
    setTechnicianQuery((prev) => ({
      ...prev,
      page: 1,
      status: value,
    }));
  };

  const handleTechniciansKycChange = (value) => {
    setTechnicianQuery((prev) => ({
      ...prev,
      page: 1,
      kyc: value,
    }));
  };

  const handleTechniciansPageChange = (newPage) => {
    setTechnicianQuery((prev) => {
      const totalPages = Math.max(1, techniciansState.pagination.totalPages || 1);
      const safePage = Math.min(Math.max(newPage, 1), totalPages);
      if (safePage === prev.page) {
        return prev;
      }
      return {
        ...prev,
        page: safePage,
      };
    });
  };

  const handleTechniciansClearFilters = () => {
    setTechnicianSearchInput('');
    setTechnicianQuery((prev) => ({
      ...prev,
      page: 1,
      search: '',
      status: 'all',
      kyc: 'all',
    }));
  };

  const handleTechniciansRefresh = () => {
    fetchAdminTechnicians();
  };

  const handleTechnicianUpdate = async (technicianId, payload, options = {}) => {
    if (!technicianId) return;
    setTechnicianActionId(technicianId);
    try {
      const { data } = await axios.patch(`/api/admin/technicians/${technicianId}`, payload);
      const updated = data?.technician;
      if (updated) {
        setTechniciansState((prev) => ({
          ...prev,
          data: prev.data.map((item) => (item.id === technicianId ? { ...item, ...updated } : item)),
        }));

        if (options.refreshUsers && updated.userId) {
          setUsersState((prev) => ({
            ...prev,
            data: prev.data.map((item) =>
              item.id === updated.userId
                ? {
                    ...item,
                    status: updated.userStatus || item.status,
                    role: updated.role || item.role,
                    serviceCount:
                      updated.assignments && typeof updated.assignments.total === 'number'
                        ? updated.assignments.total
                        : item.serviceCount,
                  }
                : item
            ),
          }));
        }
      }
    } catch (err) {
      console.error('Failed to update technician', err);
      alert(err?.response?.data?.error || 'Failed to update technician.');
    } finally {
      setTechnicianActionId(null);
    }
  };

  const handleServicesSearchInputChange = (event) => {
    setServiceSearchInput(event.target.value);
  };

  const handleServicesSearchSubmit = (event) => {
    event.preventDefault();
    setServiceQuery((prev) => ({
      ...prev,
      page: 1,
      search: serviceSearchInput.trim(),
    }));
  };

  const handleServicesFilterChange = (key, value) => {
    setServiceQuery((prev) => ({
      ...prev,
      page: 1,
      [key]: value,
    }));
  };

  const handleServicesPageChange = (newPage) => {
    setServiceQuery((prev) => {
      const totalPages = Math.max(1, servicesState.pagination.totalPages || 1);
      const safePage = Math.min(Math.max(newPage, 1), totalPages);
      if (safePage === prev.page) {
        return prev;
      }
      return {
        ...prev,
        page: safePage,
      };
    });
  };

  const handleServicesClearFilters = () => {
    setServiceSearchInput('');
    setServiceQuery((prev) => ({
      ...prev,
      page: 1,
      search: '',
      status: 'all',
      category: 'all',
      priority: 'all',
    }));
  };

  const handleServicesRefresh = () => {
    fetchAdminServices();
  };

  const handleServiceUpdate = async (service, payload) => {
    if (!service) return;
    setServiceActionId(service.id);
    try {
      const { data } = await axios.patch(`/api/admin/services/${service.id}`, payload);
      const updated = data?.service;
      if (updated) {
        setServicesState((prev) => ({
          ...prev,
          data: prev.data.map((item) => (item.id === service.id ? { ...item, ...updated } : item)),
        }));
      }
    } catch (err) {
      console.error('Failed to update service', err);
      alert(err?.response?.data?.error || 'Failed to update service.');
    } finally {
      setServiceActionId(null);
    }
  };

  const handleApprovalsApprove = async (item) => {
    await handleTechnicianUpdate(item.id, { kycStatus: 'approved', userActive: true }, { refreshUsers: true });
    fetchAdminApprovals();
    fetchAdminTechnicians();
    setProfileDialog((prev) =>
      prev.open && prev.technician?.id === item.id
        ? { open: false, loading: false, error: null, technician: null, details: null, recentServices: [] }
        : prev
    );
  };

  const handleApprovalsReject = async (item) => {
    await handleTechnicianUpdate(item.id, { kycStatus: 'rejected' }, { refreshUsers: true });
    fetchAdminApprovals();
    fetchAdminTechnicians();
    setProfileDialog((prev) =>
      prev.open && prev.technician?.id === item.id
        ? { open: false, loading: false, error: null, technician: null, details: null, recentServices: [] }
        : prev
    );
  };

  const handleApprovalsSearchInputChange = (event) => {
    setApprovalsSearchInput(event.target.value);
  };

  const handleApprovalsSearchSubmit = (event) => {
    event.preventDefault();
    setApprovalsQuery((prev) => ({
      ...prev,
      page: 1,
      search: approvalsSearchInput.trim(),
    }));
  };

  const handleApprovalsPageChange = (newPage) => {
    setApprovalsQuery((prev) => {
      const totalPages = Math.max(1, approvalsState.pagination.totalPages || 1);
      const safePage = Math.min(Math.max(newPage, 1), totalPages);
      if (safePage === prev.page) {
        return prev;
      }
      return {
        ...prev,
        page: safePage,
      };
    });
  };

  const handleApprovalsClearFilters = () => {
    setApprovalsSearchInput('');
    setApprovalsQuery((prev) => ({
      ...prev,
      page: 1,
      search: '',
    }));
  };

  const handleApprovalsRefresh = () => {
    fetchAdminApprovals();
  };

  const handleApprovalsView = async (technicianSummary) => {
    if (!technicianSummary) return;
    setProfileDialog({
      open: true,
      loading: true,
      error: null,
      technician: technicianSummary,
      details: null,
      recentServices: [],
    });
    try {
      const { data } = await axios.get(`/api/admin/technicians/${technicianSummary.id}`);
      setProfileDialog((prev) => ({
        ...prev,
        loading: false,
        error: null,
        details: data?.technician || null,
        recentServices: data?.recentServices || [],
      }));
    } catch (err) {
      console.error('Failed to load technician profile', err);
      setProfileDialog((prev) => ({
        ...prev,
        loading: false,
        error: err?.response?.data?.error || 'Failed to load technician profile.',
      }));
    }
  };

  const handleCloseProfileDialog = () =>
    setProfileDialog({
      open: false,
      loading: false,
      error: null,
      technician: null,
      details: null,
      recentServices: [],
    });

  const handleReportsRangeChange = (months) => {
    setReportsQuery({ months });
  };

  const handleSettingChange = (key, value) => {
    setSettingsState((prev) => ({
      ...prev,
      data: prev.data.map((item) => (item.key === key ? { ...item, value } : item)),
    }));
    setSettingsDirty(true);
    setSettingsMessage(null);
  };

  const handleSettingsReset = () => {
    fetchAdminSettings();
    setSettingsDirty(false);
    setSettingsMessage(null);
  };

  const handleSettingsSave = async () => {
    const payload = settingsState.data.map((item) => ({ key: item.key, value: item.value }));
    setSettingsState((prev) => ({ ...prev, saving: true, error: null }));
    setSettingsMessage(null);
    try {
      await axios.put('/api/admin/settings', payload);
      setSettingsDirty(false);
      setSettingsMessage('Settings updated successfully.');
      await fetchAdminSettings();
    } catch (err) {
      console.error('Failed to update settings', err);
      setSettingsState((prev) => ({
        ...prev,
        saving: false,
        error: err?.response?.data?.error || 'Failed to update admin settings.',
      }));
    } finally {
      setSettingsState((prev) => ({ ...prev, saving: false }));
    }
  };

  const tabs = useMemo(
    () => [
    { key: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { key: 'users', label: 'Users', icon: 'Users' },
    { key: 'technicians', label: 'Technicians', icon: 'Wrench' },
    { key: 'services', label: 'Services', icon: 'Briefcase' },
      { key: 'approvals', label: 'Approvals', icon: 'CheckCircle', badge: stats.pendingApprovals > 0 ? stats.pendingApprovals : null },
    { key: 'reports', label: 'Reports', icon: 'BarChart' },
      { key: 'settings', label: 'Settings', icon: 'Settings' },
    ],
    [stats.pendingApprovals]
  );

  const handleUserDetails = (userId) => {
    const params = new URLSearchParams(paramsKey);
    params.set('tab', 'users');
    params.set('id', userId);
    setSearchParams(params);
  };

  const handleServiceDetails = (serviceId) => {
    const params = new URLSearchParams(paramsKey);
    params.set('tab', 'services');
    params.set('id', serviceId);
    setSearchParams(params);
  };
  const handleCloseUserDetail = () => {
    const params = new URLSearchParams(paramsKey);
    params.delete('id');
    params.set('tab', 'users');
    setSearchParams(params);
    setUserDetailState({ open: false, loading: false, data: null, error: null });
  };
  const handleApproval = (technicianId, approved) => {
    console.log('Technician approval action', technicianId, approved ? 'approve' : 'reject');
  };
  const handleViewDocuments = (technicianId) => navigate(`/technician-dashboard?technicianId=${technicianId}`);

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} location="Admin Console" />

      <main className="container mx-auto px-4 pt-24 pb-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
              <p className="text-text-secondary mt-1">Manage users, technicians, and services</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" iconName="Download" iconPosition="left">
                Export Data
              </Button>
              <Button variant="default" iconName="Settings" iconPosition="left">
                System Settings
              </Button>
            </div>
          </div>
          {error ? (
            <div className="bg-warning/10 border border-warning/20 text-warning text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center space-x-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground shadow-subtle'
                  : 'bg-muted text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
              {tab.badge ? (
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {activeTab === 'overview' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers}
                  icon="Users"
                  loading={loading}
                  trendLabel="Live"
                />
                <StatCard
                  title="Technicians"
                  value={stats.totalTechnicians}
                  icon="Wrench"
                  loading={loading}
                  trendLabel={`${stats.pendingApprovals} pending`}
                />
                <StatCard
                  title="Active Services"
                  value={stats.activeServices}
                  icon="Activity"
                  loading={loading}
                  trendLabel="In progress"
                />
                <StatCard
                  title="Total Revenue"
                  value={`₹${(stats.totalRevenue / 1000).toFixed(1)}k`}
                  icon="DollarSign"
                  loading={loading}
                  trendLabel="Based on final invoices"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentUsersCard
                  loading={loading}
                  users={recentUsers}
                  onViewDetails={handleUserDetails}
                  onViewAll={() => handleTabChange('users')}
                />
                <RecentServicesCard
                  loading={loading}
                  services={recentServices}
                  onViewDetails={handleServiceDetails}
                  onViewAll={() => handleTabChange('services')}
                />
              </div>

              <PendingApprovalsCard
                loading={loading}
                technicians={pendingApprovals}
                onViewDocuments={handleViewDocuments}
                onDecision={handleApproval}
                onViewAll={() => handleTabChange('approvals')}
              />
            </div>
          ) : activeTab === 'users' ? (
            <UsersTab
              users={usersState.data}
              loading={usersState.loading}
              error={usersState.error}
              pagination={usersState.pagination}
              searchInput={userSearchInput}
              onSearchInputChange={handleUsersSearchInputChange}
              onSearchSubmit={handleUsersSearchSubmit}
              onRefresh={handleUsersRefresh}
              filters={{ role: userQuery.role, status: userQuery.status }}
              onRoleChange={handleUsersRoleChange}
              onStatusChange={handleUsersStatusChange}
              onClearFilters={handleUsersClearFilters}
              onPageChange={handleUsersPageChange}
              onViewDetail={handleUserDetails}
              onToggleActive={handleUserStatusToggle}
              updatingUserId={userActionId}
              currentAdminId={currentAdminId}
            />
          ) : activeTab === 'technicians' ? (
            <TechniciansTab
              technicians={techniciansState.data}
              loading={techniciansState.loading}
              error={techniciansState.error}
              pagination={techniciansState.pagination}
              searchInput={technicianSearchInput}
              onSearchInputChange={handleTechniciansSearchInputChange}
              onSearchSubmit={handleTechniciansSearchSubmit}
              onRefresh={handleTechniciansRefresh}
              filters={{ status: technicianQuery.status, kyc: technicianQuery.kyc }}
              onStatusChange={handleTechniciansStatusChange}
              onKycChange={handleTechniciansKycChange}
              onClearFilters={handleTechniciansClearFilters}
              onPageChange={handleTechniciansPageChange}
              onToggleAvailability={(tech) =>
                handleTechnicianUpdate(tech.id, {
                  currentStatus: tech.currentStatus === 'available' ? 'offline' : 'available',
                })
              }
              onToggleActive={(tech) =>
                handleTechnicianUpdate(
                  tech.id,
                  { userActive: tech.userStatus !== 'active' },
                  { refreshUsers: true }
                )
              }
              onApproveKyc={(tech) =>
                handleTechnicianUpdate(
                  tech.id,
                  { kycStatus: 'approved', userActive: true },
                  { refreshUsers: true }
                )
              }
              onRejectKyc={(tech) =>
                handleTechnicianUpdate(tech.id, { kycStatus: 'rejected' }, { refreshUsers: true })
              }
              updatingTechnicianId={technicianActionId}
              onViewProfile={handleApprovalsView}
            />
          ) : activeTab === 'services' ? (
            <ServicesTab
              services={servicesState.data}
              loading={servicesState.loading}
              error={servicesState.error}
              pagination={servicesState.pagination}
              searchInput={serviceSearchInput}
              onSearchInputChange={handleServicesSearchInputChange}
              onSearchSubmit={handleServicesSearchSubmit}
              onRefresh={handleServicesRefresh}
              filters={{
                status: serviceQuery.status,
                category: serviceQuery.category,
                priority: serviceQuery.priority,
              }}
              onFilterChange={handleServicesFilterChange}
              onClearFilters={handleServicesClearFilters}
              onPageChange={handleServicesPageChange}
              onUpdateStatus={(service, status) => handleServiceUpdate(service, { status })}
              onUpdatePriority={(service, priority) => handleServiceUpdate(service, { priority })}
              categories={serviceCategories}
              updatingServiceId={serviceActionId}
            />
          ) : activeTab === 'approvals' ? (
            <ApprovalsTab
              approvals={approvalsState.data}
              loading={approvalsState.loading}
              error={approvalsState.error}
              pagination={approvalsState.pagination}
              searchInput={approvalsSearchInput}
              onSearchInputChange={handleApprovalsSearchInputChange}
              onSearchSubmit={handleApprovalsSearchSubmit}
              onRefresh={handleApprovalsRefresh}
              onClearFilters={handleApprovalsClearFilters}
              onPageChange={handleApprovalsPageChange}
              onViewProfile={handleApprovalsView}
              onApprove={handleApprovalsApprove}
              onReject={handleApprovalsReject}
              updatingTechnicianId={technicianActionId}
            />
          ) : activeTab === 'reports' ? (
            <ReportsTab
              data={reportsState.data}
              loading={reportsState.loading}
              error={reportsState.error}
              months={reportsQuery.months}
              onMonthsChange={handleReportsRangeChange}
            />
          ) : activeTab === 'settings' ? (
            <SettingsTab
              settings={settingsState.data}
              loading={settingsState.loading}
              error={settingsState.error}
              saving={settingsState.saving}
              dirty={settingsDirty}
              message={settingsMessage}
              onChange={handleSettingChange}
              onSave={handleSettingsSave}
              onReset={handleSettingsReset}
            />
          ) : (
            <PlaceholderTab tab={tabs.find((t) => t.key === activeTab)} onReturn={() => handleTabChange('overview')} />
          )}
        </div>
      </main>
      <UserDetailDrawer state={userDetailState} onClose={handleCloseUserDetail} />
      {profileDialog.open && (
        <TechnicianProfileModal
          dialog={profileDialog}
          onClose={handleCloseProfileDialog}
          onApprove={() => profileDialog.technician && handleApprovalsApprove(profileDialog.technician)}
          onReject={() => profileDialog.technician && handleApprovalsReject(profileDialog.technician)}
        />
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, trendLabel, loading }) => (
                <div className="bg-card rounded-lg border border-border p-4 shadow-subtle">
                  <div className="flex items-center justify-between">
                    <div>
        <p className="text-text-secondary text-sm">{title}</p>
        <h3 className="text-2xl font-bold text-text-primary mt-1">
          {loading ? <Skeleton className="h-6 w-20" /> : typeof value === 'number' ? value.toLocaleString('en-IN') : value}
        </h3>
                    </div>
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
        <Icon name={icon} size={20} className="text-primary" />
                    </div>
                  </div>
    <div className="mt-2 text-xs text-text-secondary flex items-center">
      <Icon name="TrendingUp" size={14} className="mr-1 text-success" />
      <span>{trendLabel}</span>
                  </div>
                </div>
);

const RecentUsersCard = ({ loading, users, onViewDetails, onViewAll }) => (
                <div className="bg-card rounded-lg border border-border shadow-subtle">
    <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-text-primary">Recent Users</h3>
      <Button variant="ghost" size="sm" onClick={onViewAll}>
        View All
      </Button>
                  </div>
    <div className="p-4 space-y-4">
      {loading ? (
        <LoadingListSkeleton count={4} />
      ) : users.length === 0 ? (
        <EmptyState message="No recent users" />
      ) : (
        users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                              <Icon name={user.role === 'technician' ? 'Wrench' : 'User'} size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-text-primary">{user.name}</p>
                              <p className="text-xs text-text-secondary">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                onClick={() => onViewDetails(user.id)}
                              className="text-text-secondary hover:text-text-primary"
                            >
                <Icon name="ExternalLink" size={16} />
                            </button>
                          </div>
                        </div>
        ))
      )}
                    </div>
                  </div>
);

const RecentServicesCard = ({ loading, services, onViewDetails, onViewAll }) => (
                <div className="bg-card rounded-lg border border-border shadow-subtle">
    <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-text-primary">Recent Services</h3>
      <Button variant="ghost" size="sm" onClick={onViewAll}>
        View All
      </Button>
                  </div>
    <div className="p-4 space-y-4">
      {loading ? (
        <LoadingListSkeleton count={4} />
      ) : services.length === 0 ? (
        <EmptyState message="No recent services" />
      ) : (
        services.map((service) => (
                        <div key={service.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                              <Icon name="Tool" size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-text-primary">{service.service}</p>
                <p className="text-xs text-text-secondary">
                  {service.customer} • ₹{service.amount}
                </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
              <StatusPill status={service.status} />
                            <button
                onClick={() => onViewDetails(service.id)}
                              className="text-text-secondary hover:text-text-primary"
                            >
                <Icon name="ExternalLink" size={16} />
                            </button>
                          </div>
                        </div>
        ))
      )}
                    </div>
                  </div>
);

const PendingApprovalsCard = ({ loading, technicians, onViewDocuments, onDecision, onViewAll }) => (
  <div className="bg-card rounded-lg border border-border shadow-subtle">
    <div className="p-4 border-b border-border flex items-center justify-between">
      <h3 className="text-lg font-semibold text-text-primary">Pending Technician Approvals</h3>
      <Button variant="outline" size="sm" onClick={onViewAll}>
        View All
      </Button>
    </div>
    <div className="p-4 space-y-4">
      {loading ? (
        <LoadingListSkeleton count={3} />
      ) : technicians.length === 0 ? (
        <EmptyState message="No pending approvals" />
      ) : (
        technicians.map((tech) => (
          <div key={tech.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                <Icon name="User" size={16} />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{tech.name}</p>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-text-secondary">{tech.email}</p>
                  {tech.services?.length ? (
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {tech.services.join(', ')}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => onViewDocuments(tech.id)}>
                <Icon name="FileText" size={14} className="mr-1" />
                <span>{tech.documents || 0} docs</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-error border-error/20 hover:bg-error/10"
                onClick={() => onDecision(tech.id, false)}
              >
                Reject
              </Button>
              <Button variant="default" size="sm" onClick={() => onDecision(tech.id, true)}>
                Approve
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const TechniciansTab = ({
  technicians,
  loading,
  error,
  pagination,
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  onRefresh,
  filters,
  onStatusChange,
  onKycChange,
  onClearFilters,
  onPageChange,
  onToggleAvailability,
  onToggleActive,
  onApproveKyc,
  onRejectKyc,
  updatingTechnicianId,
  onViewProfile,
}) => {
  const statusOptions = [
    { value: 'all', label: 'All statuses' },
    { value: 'available', label: 'Available' },
    { value: 'busy', label: 'Busy' },
    { value: 'offline', label: 'Offline' },
  ];

  const kycOptions = [
    { value: 'all', label: 'All KYC states' },
    { value: 'pending', label: 'Pending review' },
    { value: 'under_review', label: 'Under review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'not_submitted', label: 'Not submitted' },
  ];

  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 10;
  const totalItems = pagination?.totalItems ?? 0;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const startItem = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = totalItems === 0 ? 0 : Math.min(page * limit, totalItems);

  const kycClasses = {
    approved: 'bg-success/10 text-success',
    under_review: 'bg-warning/10 text-warning',
    rejected: 'bg-error/10 text-error',
    not_submitted: 'bg-muted text-text-secondary',
    pending: 'bg-warning/10 text-warning',
  };

  const statusClasses = {
    available: 'bg-success/10 text-success',
    busy: 'bg-warning/10 text-warning',
    offline: 'bg-muted text-text-secondary',
  };

  const formatKycStatus = (status) => {
    if (status === 'under_review') return 'Under review';
    if (status === 'not_submitted') return 'Not submitted';
    return status ? status.replace('_', ' ') : 'Unknown';
  };

  const formatAvailability = (status) => {
    if (status === 'available') return 'Available';
    if (status === 'busy') return 'Busy';
    if (status === 'offline') return 'Offline';
    return 'Unknown';
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-subtle">
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <form onSubmit={onSearchSubmit} className="flex w-full flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={onSearchInputChange}
                placeholder="Search technicians by name, email, phone, or city"
                className="flex h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:border-black focus-visible:bg-background focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" variant="default" size="sm" iconName="Search">
                Search
              </Button>
              <Button type="button" variant="ghost" size="sm" iconName="RotateCcw" onClick={onClearFilters}>
                Reset
              </Button>
            </div>
          </form>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div className="flex flex-col text-sm">
              <span className="text-xs text-text-secondary mb-1">Availability</span>
              <select
                value={filters.status}
                onChange={(event) => onStatusChange(event.target.value)}
                className="h-11 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:border-black focus-visible:bg-background focus-visible:ring-offset-2"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col text-sm">
              <span className="text-xs text-text-secondary mb-1">KYC status</span>
              <select
                value={filters.kyc}
                onChange={(event) => onKycChange(event.target.value)}
                className="h-11 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:border-black focus-visible:bg-background focus-visible:ring-offset-2"
              >
                {kycOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <Button variant="outline" size="sm" iconName="RefreshCw" onClick={onRefresh} disabled={loading}>
              Refresh
            </Button>
          </div>
        </div>

        {error ? (
          <div className="rounded-md border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">{error}</div>
        ) : null}
      </div>

  <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-text-secondary">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Technician</th>
              <th className="px-4 py-3 text-left font-semibold">Availability</th>
              <th className="px-4 py-3 text-left font-semibold">KYC</th>
              <th className="px-4 py-3 text-left font-semibold">Assignments</th>
              <th className="px-4 py-3 text-left font-semibold">Experience</th>
              <th className="px-4 py-3 text-left font-semibold">Account</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-4 py-4" colSpan={7}>
                      <div className="h-3 w-4/5 rounded bg-muted" />
                    </td>
                  </tr>
                ))
              : technicians.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-text-secondary" colSpan={7}>
                      No technicians found. Adjust your filters and try again.
                    </td>
                  </tr>
                ) : (
                  technicians.map((tech) => (
                    <tr key={tech.id} className="bg-card">
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-text-primary">{tech.name}</p>
                          <p className="text-xs text-text-secondary">{tech.email}</p>
                          {tech.phone ? (
                            <p className="text-xs text-text-secondary">Ph: {tech.phone}</p>
                          ) : null}
                          {tech.city ? <p className="text-xs text-text-secondary">{tech.city}</p> : null}
                          {tech.specialtyLabels?.length ? (
                            <p className="text-xs text-text-secondary">
                              Specialties: {tech.specialtyLabels.join(', ')}
                            </p>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            statusClasses[tech.currentStatus] || 'bg-muted text-text-secondary'
                          }`}
                        >
                          {formatAvailability(tech.currentStatus)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            kycClasses[tech.kycStatus] || 'bg-muted text-text-secondary'
                          }`}
                        >
                          {formatKycStatus(tech.kycStatus)}
                        </span>
                        {tech.documents ? (
                          <p className="mt-1 text-xs text-text-secondary">{tech.documents} document(s)</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        <div className="space-y-1">
                          <p>Total: {tech.assignments?.total || 0}</p>
                          <p>Completed: {tech.assignments?.completed || 0}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        <div className="space-y-1">
                          <p>{tech.yearsOfExperience || 0} yrs exp</p>
                          <p>Radius: {tech.serviceRadius || 0} km</p>
                          <p>Rating: {tech.averageRating?.toFixed ? tech.averageRating.toFixed(1) : tech.averageRating || 0}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              tech.userStatus === 'active'
                                ? 'bg-success/10 text-success'
                                : 'bg-error/10 text-error'
                            }`}
                          >
                            {tech.userStatus === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewProfile?.(tech)}
                          >
                            View profile
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onToggleAvailability(tech)}
                            disabled={updatingTechnicianId === tech.id}
                            loading={updatingTechnicianId === tech.id}
                          >
                            {tech.currentStatus === 'available' ? 'Set offline' : 'Set available'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onToggleActive(tech)}
                            disabled={updatingTechnicianId === tech.id}
                          >
                            {tech.userStatus === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                          {tech.kycStatus !== 'approved' ? (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => onApproveKyc(tech)}
                              disabled={updatingTechnicianId === tech.id}
                              loading={updatingTechnicianId === tech.id}
                            >
                              Approve KYC
                            </Button>
                          ) : null}
                          {tech.kycStatus === 'under_review' || tech.kycStatus === 'approved' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-error border-error/20 hover:bg-error/10"
                              onClick={() => onRejectKyc(tech)}
                              disabled={updatingTechnicianId === tech.id}
                            >
                              Reject KYC
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-border px-4 py-4 text-sm text-text-secondary md:flex-row md:items-center md:justify-between">
        <div>
          {totalItems > 0 ? (
            <span>
              Showing {startItem}-{endItem} of {totalItems}
            </span>
          ) : (
            <span>No technicians to display</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
          >
            Previous
          </Button>
          <span className="text-xs text-text-secondary">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || loading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

const ServicesTab = ({
  services,
  loading,
  error,
  pagination,
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  onRefresh,
  filters,
  onFilterChange,
  onClearFilters,
  onPageChange,
  onUpdateStatus,
  onUpdatePriority,
  categories,
  updatingServiceId,
}) => {
  const statusOptions = [
    { value: 'all', label: 'All statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in_progress', label: 'In progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const priorityOptions = [
    { value: 'all', label: 'All priorities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  const categoryOptions = [{ value: 'all', label: 'All categories' }].concat(
    (categories || []).map((value) => ({ value, label: value.replace('_', ' ') }))
  );

  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 10;
  const totalItems = pagination?.totalItems ?? 0;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const startItem = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = totalItems === 0 ? 0 : Math.min(page * limit, totalItems);

  const statusClasses = {
    pending: 'bg-warning/10 text-warning',
    confirmed: 'bg-info/10 text-info',
    in_progress: 'bg-primary/10 text-primary',
    completed: 'bg-success/10 text-success',
    cancelled: 'bg-error/10 text-error',
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-subtle">
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <form onSubmit={onSearchSubmit} className="flex w-full flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={onSearchInputChange}
                placeholder="Search services by title, customer, technician, or location"
                className="flex h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:border-black focus-visible:bg-background focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" variant="default" size="sm" iconName="Search">
                Search
              </Button>
              <Button type="button" variant="ghost" size="sm" iconName="RotateCcw" onClick={onClearFilters}>
                Reset
              </Button>
            </div>
          </form>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div className="flex flex-col text-sm">
              <span className="text-xs text-text-secondary mb-1">Status</span>
              <select
                value={filters.status}
                onChange={(event) => onFilterChange('status', event.target.value)}
                className="h-11 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:border-black focus-visible:bg-background focus-visible:ring-offset-2"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col text-sm">
              <span className="text-xs text-text-secondary mb-1">Category</span>
              <select
                value={filters.category}
                onChange={(event) => onFilterChange('category', event.target.value)}
                className="h-11 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:border-black focus-visible:bg-background focus-visible:ring-offset-2"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col text-sm">
              <span className="text-xs text-text-secondary mb-1">Priority</span>
              <select
                value={filters.priority}
                onChange={(event) => onFilterChange('priority', event.target.value)}
                className="h-11 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:border-black focus-visible:bg-background focus-visible:ring-offset-2"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <Button variant="outline" size="sm" iconName="RefreshCw" onClick={onRefresh} disabled={loading}>
              Refresh
            </Button>
          </div>
        </div>

        {error ? (
          <div className="rounded-md border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">{error}</div>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-text-secondary">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Service</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Priority</th>
              <th className="px-4 py-3 text-left font-semibold">Customer</th>
              <th className="px-4 py-3 text-left font-semibold">Technician</th>
              <th className="px-4 py-3 text-left font-semibold">Budget / Cost</th>
              <th className="px-4 py-3 text-left font-semibold">Updated</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-4 py-4" colSpan={8}>
                      <div className="h-3 w-4/5 rounded bg-muted" />
                    </td>
                  </tr>
                ))
              : services.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-text-secondary" colSpan={8}>
                      No services found. Adjust your filters and try again.
                    </td>
                  </tr>
                ) : (
                  services.map((service) => (
                    <tr key={service.id} className="bg-card">
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-text-primary">{service.title}</p>
                          <p className="text-xs text-text-secondary">{service.category}</p>
                          <p className="text-xs text-text-secondary line-clamp-2">{service.description}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            statusClasses[service.status] || 'bg-muted text-text-secondary'
                          }`}
                        >
                          {service.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={service.priority || 'medium'}
                          onChange={(event) => onUpdatePriority(service, event.target.value)}
                          className="rounded-md border border-border bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                          disabled={updatingServiceId === service.id}
                        >
                          {priorityOptions
                            .filter((option) => option.value !== 'all')
                            .map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        <div className="space-y-1">
                          <p>{service.customer?.name || 'Customer'}</p>
                          {service.customer?.email ? <p className="text-xs">{service.customer.email}</p> : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        <div className="space-y-1">
                          <p>{service.technician?.name || 'Unassigned'}</p>
                          {service.technician?.email ? <p className="text-xs">{service.technician.email}</p> : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        <div className="space-y-1">
                          {service.budgetMin || service.budgetMax ? (
                            <p>
                              Budget: ₹{service.budgetMin || 0} - ₹{service.budgetMax || service.budgetMin || 0}
                            </p>
                          ) : null}
                          {service.finalCost ? <p>Final: ₹{service.finalCost}</p> : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {service.updatedAt ? new Date(service.updatedAt).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          {['pending', 'confirmed'].includes(service.status) ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onUpdateStatus(service, 'in_progress')}
                              disabled={updatingServiceId === service.id}
                              loading={updatingServiceId === service.id}
                            >
                              Start
                            </Button>
                          ) : null}
                          {service.status !== 'completed' ? (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => onUpdateStatus(service, 'completed')}
                              disabled={updatingServiceId === service.id}
                              loading={updatingServiceId === service.id}
                            >
                              Complete
                            </Button>
                          ) : null}
                          {service.status !== 'cancelled' && service.status !== 'completed' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-error border-error/20 hover:bg-error/10"
                              onClick={() => onUpdateStatus(service, 'cancelled')}
                              disabled={updatingServiceId === service.id}
                            >
                              Cancel
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-border px-4 py-4 text-sm text-text-secondary md:flex-row md:items-center md:justify-between">
        <div>
          {totalItems > 0 ? (
            <span>
              Showing {startItem}-{endItem} of {totalItems}
            </span>
          ) : (
            <span>No services to display</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
          >
            Previous
          </Button>
          <span className="text-xs text-text-secondary">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || loading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

const ApprovalsTab = ({
  approvals,
  loading,
  error,
  pagination,
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  onRefresh,
  onClearFilters,
  onPageChange,
  onViewProfile,
  onApprove,
  onReject,
  updatingTechnicianId,
}) => {
  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 10;
  const totalItems = pagination?.totalItems ?? 0;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const startItem = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = totalItems === 0 ? 0 : Math.min(page * limit, totalItems);

  return (
    <div className="bg-card rounded-lg border border-border shadow-subtle">
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <form onSubmit={onSearchSubmit} className="flex w-full flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={onSearchInputChange}
                placeholder="Search pending technicians by name, email, or phone"
                className="flex h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:border-black focus-visible:bg-background focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" variant="default" size="sm" iconName="Search">
                Search
              </Button>
              <Button type="button" variant="ghost" size="sm" iconName="RotateCcw" onClick={onClearFilters}>
                Reset
              </Button>
            </div>
          </form>

          <Button variant="outline" size="sm" iconName="RefreshCw" onClick={onRefresh} disabled={loading}>
            Refresh
          </Button>
        </div>

        {error ? (
          <div className="rounded-md border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">{error}</div>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-text-secondary">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Technician</th>
              <th className="px-4 py-3 text-left font-semibold">Specialties</th>
              <th className="px-4 py-3 text-left font-semibold">Submitted</th>
              <th className="px-4 py-3 text-left font-semibold">Documents</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-4 py-4" colSpan={5}>
                      <div className="h-3 w-4/5 rounded bg-muted" />
                    </td>
                  </tr>
                ))
              : approvals.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-text-secondary" colSpan={5}>
                      No technicians awaiting approval.
                    </td>
                  </tr>
                ) : (
                  approvals.map((item) => (
                    <tr key={item.id} className="bg-card">
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-text-primary">{item.name}</p>
                          <p className="text-xs text-text-secondary">{item.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {item.specialtyLabels && item.specialtyLabels.length > 0
                          ? item.specialtyLabels.join(', ')
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">
                        {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{item.documents || 0}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewProfile(item)}
                          >
                            View profile
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-error border-error/20 hover:bg-error/10"
                            onClick={() => onReject(item)}
                            disabled={updatingTechnicianId === item.id}
                          >
                            Reject
                          </Button>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => onApprove(item)}
                            disabled={updatingTechnicianId === item.id}
                            loading={updatingTechnicianId === item.id}
                          >
                            Approve
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-border px-4 py-4 text-sm	text-text-secondary md:flex-row md:items-center md:justify-between">
        <div>
          {totalItems > 0 ? (
            <span>
              Showing {startItem}-{endItem} of {totalItems}
            </span>
          ) : (
            <span>No approvals to display</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
          >
            Previous
          </Button>
          <span className="text-xs text-text-secondary">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || loading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

const ReportsTab = ({ data, loading, error, months, onMonthsChange }) => {
  const rangeOptions = [3, 6, 12];

  return (
    <div className="bg-card rounded-lg border border-border shadow-subtle p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-text-primary">Platform analytics</h3>
          <p className="text-sm text-text-secondary">
            Monitor revenue trends, service throughput, and technician performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {rangeOptions.map((option) => (
            <Button
              key={option}
              variant={option === months ? 'default' : 'outline'}
              size="sm"
              onClick={() => onMonthsChange(option)}
            >
              Last {option}m
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingListSkeleton count={4} />
      ) : error ? (
        <div className="rounded-md border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">{error}</div>
      ) : !data ? (
        <EmptyState message="No analytics data available yet." />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/40 border border-border rounded-lg p-4">
              <p className="text-xs text-text-secondary uppercase tracking-wide">Completion rate</p>
              <p className="text-2xl font-semibold text-text-primary mt-2">{data.averages?.completionRate || 0}%</p>
            </div>
            <div className="bg-muted/40 border border-border rounded-lg p-4">
              <p className="text-xs text-text-secondary uppercase tracking-wide">Avg. resolution time</p>
              <p className="text-2xl font-semibold text-text-primary mt-2">
                {data.averages?.avgResolutionHours != null ? `${data.averages.avgResolutionHours} hrs` : '—'}
              </p>
            </div>
            <div className="bg-muted/40 border border-border rounded-lg p-4">
              <p className="text-xs text-text-secondary uppercase tracking-wide">Months analysed</p>
              <p className="text-2xl font-semibold text-text-primary mt-2">{months}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-border rounded-lg">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h4 className="text-sm font-semibold text-text-primary">Monthly performance</h4>
              </div>
              <div className="p-4 space-y-3">
                {data.monthlyPerformance?.length ? (
                  data.monthlyPerformance.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{item.label}</p>
                        <p className="text-xs text-text-secondary">
                          {item.completed} completed • ₹{item.revenue.toLocaleString('en-IN')} revenue
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-secondary">
                        <span className="inline-block h-2 w-16 rounded-full bg-primary/20 overflow-hidden">
                          <span
                            className="block h-full bg-primary"
                            style={{
                              width:
                                item.totalRequests > 0
                                  ? `${Math.min(100, (item.completed / item.totalRequests) * 100)}%`
                                  : '4px',
                            }}
                          />
                        </span>
                        <span>{item.totalRequests} jobs</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState message="No monthly performance data." />
                )}
              </div>
            </div>

            <div className="grid grid-rows-2 gap-6">
              <div className="border border-border rounded-lg">
                <div className="border-b border-border px-4 py-3">
                  <h4 className="text-sm font-semibold text-text-primary">Status distribution</h4>
                </div>
                <div className="p-4 space-y-2 text-sm text-text-secondary">
                  {data.statusSummary?.length ? (
                    data.statusSummary.map((item) => (
                      <div key={item.status} className="flex justify-between">
                        <span className="capitalize">{item.status.replace('_', ' ')}</span>
                        <span>{item.count}</span>
                      </div>
                    ))
                  ) : (
                    <EmptyState message="No status summary available." />
                  )}
                </div>
              </div>

              <div className="border border-border rounded-lg">
                <div className="border-b border-border px-4 py-3">
                  <h4 className="text-sm font-semibold text-text-primary">Top categories</h4>
                </div>
                <div className="p-4 space-y-2 text-sm text-text-secondary">
                  {data.categorySummary?.length ? (
                    data.categorySummary.map((item) => (
                      <div key={item.category} className="flex justify-between">
                        <span className="capitalize">{item.category?.replace('_', ' ')}</span>
                        <span>
                          {item.count} • ₹{item.revenue.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <EmptyState message="No category insights yet." />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-border rounded-lg">
              <div className="border-b border-border px-4 py-3">
                <h4 className="text-sm font-semibold text-text-primary">Top technicians</h4>
              </div>
              <div className="p-4 space-y-2 text-sm text-text-secondary">
                {data.technicianPerformance?.length ? (
                  data.technicianPerformance.map((tech) => (
                    <div key={tech.technicianId} className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{tech.name}</p>
                        {tech.email ? <p className="text-xs">{tech.email}</p> : null}
                      </div>
                      <div className="text-right">
                        <p>{tech.completedJobs} jobs</p>
                        <p className="text-xs">Rating: {tech.avgRating ?? '—'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState message="No technician performance data." />
                )}
              </div>
            </div>

            <div className="border border-border rounded-lg">
              <div className="border-b border-border px-4 py-3">
                <h4 className="text-sm font-semibold text-text-primary">Customer signups</h4>
              </div>
              <div className="p-4 space-y-2 text-sm text-text-secondary">
                {data.customerGrowth?.length ? (
                  data.customerGrowth.map((item) => (
                    <div key={item.label} className="flex justify-between">
                      <span>{item.label}</span>
                      <span>{item.total}</span>
                    </div>
                  ))
                ) : (
                  <EmptyState message="No signup data in this range." />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsTab = ({
  settings,
  loading,
  error,
  saving,
  dirty,
  message,
  onChange,
  onSave,
  onReset,
}) => {
  const grouped = useMemo(() => {
    return settings.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [settings]);

  return (
    <div className="bg-card rounded-lg border border-border shadow-subtle p-6 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-text-primary">Platform settings</h3>
          <p className="text-sm text-text-secondary">
            Configure operational behaviour and global toggles for SmartTech Connect.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onReset} disabled={loading || saving}>
            Reset
          </Button>
          <Button variant="default" size="sm" onClick={onSave} disabled={!dirty || saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </div>

      {message ? (
        <div className="rounded-md border border-success/20 bg-success/10 px-3 py-2 text-sm text-success">
          {message}
        </div>
      ) : null}

      {loading ? (
        <LoadingListSkeleton count={4} />
      ) : error ? (
        <div className="rounded-md border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">{error}</div>
      ) : settings.length === 0 ? (
        <EmptyState message="No configurable settings yet." />
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="border border-border rounded-lg">
            <div className="border-b border-border px-4 py-3">
              <h4 className="text-sm font-semibold text-text-primary capitalize">{category}</h4>
            </div>
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div key={item.key} className="px-4 py-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{item.label}</p>
                    {item.description ? (
                      <p className="text-xs text-text-secondary max-w-md">{item.description}</p>
                    ) : null}
                  </div>
                  <div className="w-full md:w-64">
                    {item.type === 'boolean' ? (
                      <label className="inline-flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-border"
                          checked={Boolean(item.value)}
                          onChange={(event) => onChange(item.key, event.target.checked)}
                        />
                        <span>{Boolean(item.value) ? 'Enabled' : 'Disabled'}</span>
                      </label>
                    ) : item.type === 'number' ? (
                      <input
                        type="number"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                        value={item.value ?? ''}
                        onChange={(event) => onChange(item.key, Number(event.target.value))}
                      />
                    ) : item.type === 'json' ? (
                      <textarea
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                        rows={3}
                        value={typeof item.value === 'string' ? item.value : JSON.stringify(item.value, null, 2)}
                        onChange={(event) => onChange(item.key, event.target.value)}
                      />
                    ) : (
                      <input
                        type="text"
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
                        value={item.value ?? ''}
                        onChange={(event) => onChange(item.key, event.target.value)}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

const UserDetailDrawer = ({ state, onClose }) => {
  if (!state?.open) return null;

  const { loading, data, error } = state;
  const user = data?.user || {};
  const technician = user?.technician || null;
  const recentServices = data?.recentServices || [];

  const formatDateTime = (value) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleString();
    } catch {
      return '—';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-4xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">User details</h3>
            <p className="text-sm text-text-secondary">
              Review account history and recent service activity for this user.
            </p>
          </div>
          <button
            type="button"
            className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-muted"
            onClick={onClose}
          >
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <LoadingListSkeleton count={4} />
          ) : error ? (
            <div className="rounded-md border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">{error}</div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-text-primary">{user.name}</p>
                  <p className="text-xs text-text-secondary">{user.email}</p>
                  {user.phone ? <p className="text-xs text-text-secondary">{user.phone}</p> : null}
                  {user.city ? <p className="text-xs text-text-secondary">{user.city}</p> : null}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium capitalize text-text-secondary">
                      {user.role || 'user'}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        user.status === 'active'
                          ? 'bg-success/10 text-success'
                          : 'bg-error/10 text-error'
                      }`}
                    >
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="grid gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-xs text-text-secondary">
                  <div className="flex items-center justify-between">
                    <span>Member since</span>
                    <span>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total requests</span>
                    <span>{user.serviceCount ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last updated</span>
                    <span>{user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : '—'}</span>
                  </div>
                </div>
              </div>

              {technician ? (
                <div className="rounded-lg border border-border bg-muted/30 px-4 py-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-text-primary">Technician profile</h4>
                    <span className="text-xs text-text-secondary">
                      Status: {technician.currentStatus || 'unknown'} • KYC: {technician.kycStatus || 'pending'}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2 text-xs text-text-secondary">
                    <div>
                      <p>Experience: {technician.yearsOfExperience ?? 0} years</p>
                      <p>Service radius: {technician.serviceRadius ?? 0} km</p>
                      <p>Average rating: {technician.averageRating ?? 0}</p>
                    </div>
                    <div>
                      <p>Hourly rate: ₹{technician.hourlyRate ?? 0}</p>
                      <p>Total jobs: {technician.totalJobs ?? 0}</p>
                      {technician.specialtyLabels?.length ? (
                        <p>Specialties: {technician.specialtyLabels.join(', ')}</p>
                      ) : null}
                    </div>
                  </div>

                  {technician.documentsInfo ? (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                        Verification documents
                      </p>
                  <DocumentRow
                    label="Government ID"
                    url={technician.documentsInfo.governmentId}
                    originalName={technician.documentsInfo.governmentOriginal}
                  />
                  <DocumentRow
                    label="Selfie"
                    url={technician.documentsInfo.selfie}
                    originalName={technician.documentsInfo.selfieOriginal}
                  />
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-2">Recent service history</h4>
                {recentServices.length ? (
                  <div className="space-y-2 text-xs text-text-secondary">
                    {recentServices.map((service) => (
                      <div key={service.id} className="rounded-md border border-border px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-text-primary">{service.title}</span>
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                            {service.status?.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-3">
                          <span>Category: {service.category}</span>
                          <span>Amount: ₹{service.amount ?? 0}</span>
                          <span>Updated: {formatDateTime(service.date || service.updatedAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No recent services recorded for this user." />
                )}
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

const TechnicianProfileModal = ({ dialog, onClose, onApprove, onReject }) => {
  const { loading, error, details, recentServices, technician } = dialog;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-3xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Technician profile</h3>
            <p className="text-sm text-text-secondary">
              Review documents and recent activity before approving this technician.
            </p>
          </div>
          <button
            type="button"
            className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-muted"
            onClick={onClose}
          >
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <LoadingListSkeleton count={4} />
          ) : error ? (
            <div className="rounded-md border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">{error}</div>
          ) : details ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-text-primary">{details.name}</p>
                  <p className="text-xs text-text-secondary">{details.email}</p>
                  {details.phone ? <p className="text-xs text-text-secondary">{details.phone}</p> : null}
                  <p className="text-xs text-text-secondary">
                    City: {details.city || technician?.city || 'Not provided'}
                  </p>
                  {details.specialtyLabels?.length ? (
                    <p className="text-xs text-text-secondary">
                      Specialties: {details.specialtyLabels.join(', ')}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-1 text-sm text-text-secondary">
                  <p>
                    Status: <span className="font-medium capitalize">{details.currentStatus || 'offline'}</span>
                  </p>
                  <p>
                    KYC status: <span className="font-medium capitalize">{details.kycStatus || 'unknown'}</span>
                  </p>
                  <p>Experience: {details.yearsOfExperience || 0} years</p>
                  <p>Service radius: {details.serviceRadius || 0} km</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-2">Uploaded documents</h4>
                <div className="flex flex-col gap-2 text-sm text-text-secondary">
                  <DocumentRow
                    label="Government ID"
                    url={details.documentsInfo?.governmentId}
                    originalName={details.documentsInfo?.governmentOriginal}
                  />
                  <DocumentRow
                    label="Selfie / Profile photo"
                    url={details.documentsInfo?.selfie}
                    originalName={details.documentsInfo?.selfieOriginal}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-2">Recent services handled</h4>
                {recentServices?.length ? (
                  <div className="space-y-2 text-sm text-text-secondary">
                    {recentServices.map((service) => (
                      <div
                        key={service.id}
                        className="rounded-md border border-border px-3 py-2 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-text-primary">{service.title}</p>
                          <p className="text-xs text-text-secondary">
                            Status: {service.status?.replace('_', ' ')} • Customer: {service.customer || '—'}
                          </p>
                        </div>
                        <div className="text-xs text-text-secondary text-right">
                          {service.updatedAt ? new Date(service.updatedAt).toLocaleString() : '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No recent service activity recorded." />
                )}
              </div>
            </div>
          ) : (
            <EmptyState message="No technician details available." />
          )}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-error border-error/20 hover:bg-error/10"
            onClick={onReject}
            disabled={!technician}
          >
            Reject
          </Button>
          <Button variant="success" size="sm" onClick={onApprove} disabled={!technician}>
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
};

const DocumentRow = ({ label, url, originalName }) => {
  const resolvedUrl = useMemo(() => {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    const backendBase =
      import.meta.env.VITE_BACKEND_URL ||
      import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '');
    if (backendBase) {
      return `${backendBase.replace(/\/$/, '')}${url}`;
    }
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const base = origin.includes('localhost:5173') ? 'http://localhost:5000' : origin;
      return `${base.replace(/\/$/, '')}${url}`;
    }
    return url;
  }, [url]);

  return (
    <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-secondary">{originalName || 'Not uploaded yet'}</p>
      </div>
      {resolvedUrl ? (
        <a
          href={resolvedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:text-primary/80 inline-flex items-center gap-1"
        >
          <Icon name="Download" size={14} />
          View
        </a>
      ) : (
        <span className="text-xs text-text-secondary">—</span>
      )}
    </div>
  );
};

const UsersTab = ({
  users,
  loading,
  error,
  pagination,
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  onRefresh,
  filters,
  onRoleChange,
  onStatusChange,
  onClearFilters,
  onPageChange,
  onViewDetail,
  onToggleActive,
  updatingUserId,
  currentAdminId,
}) => {
  const roleOptions = [
    { value: 'all', label: 'All roles' },
    { value: 'user', label: 'Customers' },
    { value: 'technician', label: 'Technicians' },
    { value: 'admin', label: 'Admins' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const page = pagination?.page ?? 1;
  const limit = pagination?.limit ?? 10;
  const totalItems = pagination?.totalItems ?? 0;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const startItem = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = totalItems === 0 ? 0 : Math.min(page * limit, totalItems);

  const formatTechnicianStatus = (technician) => {
    if (!technician) return 'No profile';
    switch (technician.kycStatus) {
      case 'approved':
        return technician.currentStatus ? `Active • ${technician.currentStatus}` : 'Active';
      case 'under_review':
        return 'KYC under review';
      case 'rejected':
        return 'KYC rejected';
      case 'not_submitted':
      default:
        return 'KYC pending';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-subtle">
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <form onSubmit={onSearchSubmit} className="flex w-full flex-col gap-3 md:flex-row md:items-center">
            <div className="flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={onSearchInputChange}
                placeholder="Search by name, email, phone, or city"
                className="flex h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:border-black focus-visible:bg-background focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" variant="default" size="sm" iconName="Search">
                Search
              </Button>
              <Button type="button" variant="ghost" size="sm" iconName="RotateCcw" onClick={onClearFilters}>
                Reset
              </Button>
            </div>
          </form>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div className="flex flex-col text-sm">
              <span className="text-xs text-text-secondary mb-1">Role</span>
              <select
                value={filters.role}
                onChange={(event) => onRoleChange(event.target.value)}
                className="h-11 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:border-black focus-visible:bg-background focus-visible:ring-offset-2"
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col text-sm">
              <span className="text-xs text-text-secondary mb-1">Status</span>
              <select
                value={filters.status}
                onChange={(event) => onStatusChange(event.target.value)}
                className="h-11 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:border-black focus-visible:bg-background focus-visible:ring-offset-2"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <Button variant="outline" size="sm" iconName="RefreshCw" onClick={onRefresh} disabled={loading}>
              Refresh
            </Button>
          </div>
        </div>

        {error ? (
          <div className="rounded-md border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">{error}</div>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-text-secondary">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">User</th>
              <th className="px-4 py-3 text-left font-semibold">Role</th>
              <th className="px-4 py-3 text-left font-semibold">Services</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Joined</th>
              <th className="px-4 py-3 text-left font-semibold">Technician</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-4 py-4" colSpan={7}>
                      <div className="h-3 w-4/5 rounded bg-muted" />
                    </td>
                  </tr>
                ))
              : users.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-text-secondary" colSpan={7}>
                      No users found. Adjust your filters and try again.
                    </td>
                  </tr>
                ) : (
                  users.map((item) => {
                    const isSelf = currentAdminId && item.id === currentAdminId;
                    return (
                      <tr key={item.id} className="bg-card">
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-text-primary">{item.name}</p>
                            <p className="text-xs text-text-secondary">{item.email}</p>
                            {item.phone ? (
                              <p className="text-xs text-text-secondary">Ph: {item.phone}</p>
                            ) : null}
                            {item.city ? (
                              <p className="text-xs text-text-secondary">{item.city}</p>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium capitalize text-text-secondary">
                            {item.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-primary">
                          {item.serviceCount != null ? item.serviceCount : 0}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              item.status === 'active'
                                ? 'bg-success/10 text-success'
                                : 'bg-error/10 text-error'
                            }`}
                          >
                            {item.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-secondary">
                          {item.role === 'technician' ? formatTechnicianStatus(item.technician) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewDetail?.(item.id)}
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onToggleActive(item)}
                              disabled={updatingUserId === item.id || isSelf}
                              loading={updatingUserId === item.id}
                            >
                              {item.status === 'active' ? 'Deactivate' : 'Activate'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-border px-4 py-4 text-sm text-text-secondary md:flex-row md:items-center md:justify-between">
        <div>
          {totalItems > 0 ? (
            <span>
              Showing {startItem}-{endItem} of {totalItems}
            </span>
          ) : (
            <span>No users to display</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1 || loading}
          >
            Previous
          </Button>
          <span className="text-xs text-text-secondary">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages || loading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

const PlaceholderTab = ({ tab, onReturn }) => (
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <Icon name="Construction" size={48} className="mx-auto text-text-secondary mb-4" />
    <h3 className="text-xl font-semibold text-text-primary mb-2">{tab?.label} Section</h3>
              <p className="text-text-secondary max-w-md mx-auto">
      This section is under construction. The {tab?.label?.toLowerCase()} management functionality will be implemented in later updates.
              </p>
    <Button variant="outline" className="mt-4" onClick={onReturn}>
                Return to Overview
              </Button>
            </div>
);

const StatusPill = ({ status }) => {
  const map = {
    completed: 'bg-success/10 text-success',
    in_progress: 'bg-primary/10 text-primary',
    scheduled: 'bg-info/10 text-info',
    cancelled: 'bg-error/10 text-error',
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${map[status] || 'bg-muted text-text-secondary'}`}>
      {status?.replace('_', ' ')}
    </span>
  );
};

const Skeleton = ({ className }) => <div className={`animate-pulse rounded bg-muted ${className}`} />;

const LoadingListSkeleton = ({ count }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="animate-pulse flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-muted rounded-full" />
          <div className="space-y-2">
            <div className="h-3 w-24 bg-muted rounded" />
            <div className="h-3 w-36 bg-muted rounded" />
          </div>
        </div>
        <div className="h-6 w-16 bg-muted rounded" />
      </div>
    ))}
    </div>
  );

const EmptyState = ({ message }) => (
  <div className="text-center text-sm text-text-secondary py-8">{message}</div>
);

export default AdminDashboard;