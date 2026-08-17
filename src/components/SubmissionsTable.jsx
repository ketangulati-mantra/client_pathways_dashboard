import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Search, RefreshCw, Download, FileSpreadsheet, Calendar, User, ExternalLink, Filter, ChevronRight, X, Sparkles, Database, Layers, CheckCircle2, ZoomIn, ZoomOut, RotateCcw, Clock, Eye, Mail, Image, FileText, Phone, Trash2, Plus, BarChart3, Users, Video, VideoOff } from 'lucide-react';
import { fetchAllSubmissions, reviewSubmissionStatus, fetchSubmissionAnalytics, fetchAdminReviewers, addAdminReviewer, deleteAdminReviewer, fetchSubmissionActivities } from '../mantra/api';
import { useToast } from './Toast';
import { useAuth } from '../auth/AuthContext';
import ManageReviewersModal from './admin/ManageReviewersModal';
import { activities as registeredActivities } from '../mantra/activities';
import { COUNTRY_LIST } from '../utils/countryData';

export const normalizeImageUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let cleaned = rawUrl.trim().replace(/^['"]|['"]$/g, '');
  if (!cleaned || ['null', 'undefined', 'none', 'n/a', '[object object]'].includes(cleaned.toLowerCase())) return '';

  if (cleaned.startsWith('http://')) {
    cleaned = 'https://' + cleaned.slice(7);
  } else if (cleaned.startsWith('//')) {
    cleaned = 'https:' + cleaned;
  } else if (!cleaned.startsWith('https://') && !cleaned.startsWith('data:') && !cleaned.startsWith('blob:')) {
    if (cleaned.includes('cloudinary.com')) {
      cleaned = 'https://' + cleaned.replace(/^(https?:\/\/)?/, '');
    } else if (cleaned.startsWith('/')) {
      cleaned = window.location.origin + cleaned;
    } else if (cleaned.startsWith('v1') || cleaned.includes('upload') || cleaned.includes('.')) {
      cleaned = `https://res.cloudinary.com/hxbamdqf/image/upload/${cleaned}`;
    }
  }
  return cleaned;
};

/* Interactive Photo Preview Modal with Zoom & Drag Support */
function InteractiveImageModal({ imageUrl, onClose }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasLoadError, setHasLoadError] = useState(false);
  const containerRef = useRef(null);
  const cleanUrl = normalizeImageUrl(imageUrl);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.35, 4.5));
  const handleZoomOut = () => {
    setScale(prev => {
      const next = Math.max(prev - 0.35, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse Wheel Zoom Listener
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 0.2 : -0.2;
      setScale((prevScale) => {
        const nextScale = Math.min(Math.max(prevScale + zoomFactor, 1), 4.5);
        if (nextScale === 1) setPosition({ x: 0, y: 0 });
        return nextScale;
      });
    };

    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleMouseDown = (e) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || scale <= 1) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div
      ref={containerRef}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999999,
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      {/* Top Floating Control Toolbar */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#ffffff',
          padding: '8px 20px',
          borderRadius: '40px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          border: '1px solid #e2e8f0',
          zIndex: 10
        }}
      >
        <button
          onClick={handleZoomOut}
          disabled={scale <= 1}
          title="Zoom Out"
          style={{
            background: 'none', border: 'none', cursor: scale <= 1 ? 'not-allowed' : 'pointer',
            opacity: scale <= 1 ? 0.35 : 1, display: 'flex', alignItems: 'center', color: '#0f172a', padding: '4px'
          }}
        >
          <ZoomOut size={18} />
        </button>

        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', minWidth: '45px', textAlign: 'center' }}>
          {Math.round(scale * 100)}%
        </span>

        <button
          onClick={handleZoomIn}
          disabled={scale >= 4.5}
          title="Zoom In"
          style={{
            background: 'none', border: 'none', cursor: scale >= 4.5 ? 'not-allowed' : 'pointer',
            opacity: scale >= 4.5 ? 0.35 : 1, display: 'flex', alignItems: 'center', color: '#0f172a', padding: '4px'
          }}
        >
          <ZoomIn size={18} />
        </button>

        <div style={{ width: '1px', height: '16px', background: '#cbd5e1' }} />

        <button
          onClick={handleReset}
          title="Reset View"
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748b', padding: '4px' }}
        >
          <RotateCcw size={16} />
        </button>

        <button
          onClick={onClose}
          title="Close Preview"
          style={{
            background: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', color: '#ffffff', marginLeft: '4px'
          }}
        >
          <X size={15} />
        </button>
      </div>

      {/* Interactive Image Display Area */}
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: '90vw',
          height: '82vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
        }}
      >
        {!hasLoadError && cleanUrl ? (
          <img
            src={cleanUrl}
            alt="Proof Preview"
            draggable={false}
            onError={() => setHasLoadError(true)}
            style={{
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain',
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              borderRadius: '10px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
              background: '#ffffff'
            }}
          />
        ) : (
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '32px 24px',
            textAlign: 'center',
            maxWidth: '420px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            border: '1px solid #cbd5e1'
          }}>
            <Image size={40} color="#64748b" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              Proof Image Preview
            </div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '18px', wordBreak: 'break-all' }}>
              {imageUrl || 'Image file URL is missing or protected.'}
            </div>
            {cleanUrl && (
              <a
                href={cleanUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                Open Direct Image <ExternalLink size={14} />
              </a>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

const formatActivityTitle = (title, lessonId) => {
  if (!title && !lessonId) return 'Mantra intro video';
  const lower = (title || '').toLowerCase();
  const lId = (lessonId || '').toLowerCase();

  // Specific Lesson Initiatives
  if (lId === 'fundraising' || lower.includes('fund raising') || lower.includes('fundraising')) {
    return 'Fund Raising for Mantra Foundation';
  }
  if (lId === 'campus-awareness' || lower.includes('campus ambassador')) {
    return 'Campus Ambassador Program';
  }
  if (lId === 'corporate-eap' || lower.includes('corporate growth partner')) {
    return 'Corporate Growth Partner Program';
  }
  if (lId === 'intern-program' || lower.includes('intern program')) {
    return 'Mantra Foundation Therapy Intern Program';
  }
  if (lId === 'recruit-interns' || lower.includes('recruit')) {
    return 'Help Recruit New Therapy Interns';
  }
  if (lId === 'sales-partner' || lower.includes('sales partner')) {
    return 'Mantra Sales Partner';
  }
  if (lId === 'community-management' || lower.includes('community management')) {
    return 'Community Management';
  }
  if (lId === 'content-creation' || lower.includes('content creation')) {
    return 'Content Creation for Mental Health';
  }

  // Intro Video Marketing Lessons
  if (lId === 'ocd-market-yourself' || lower.includes('ocdmantra')) {
    return 'OCD intro video';
  }
  if (lId === 'physio-market-yourself' || lower.includes('physiomantra')) {
    return 'Physio intro video';
  }
  if (lId === 'market-yourself' || lower.includes('therapymantra')) {
    return 'Therapy intro video';
  }
  if (lId === 'mantra-market-yourself' || lower.includes('mantracare')) {
    return 'Mantra intro video';
  }

  return title || 'Mantra intro video';
};

function isDateInPeriod(dateStr, period, startDate, endDate) {
  if (!dateStr || period === 'all_time') return true;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return true;

  const now = new Date();

  if (period === 'today') {
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return d >= startOfDay;
  }
  if (period === 'yesterday') {
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return d >= startOfYesterday && d < endOfYesterday;
  }
  if (period === 'this_week') {
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
    return d >= startOfWeek;
  }
  if (period === 'this_month') {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return d >= startOfMonth;
  }
  if (period === 'last_month') {
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    return d >= startOfLastMonth && d <= endOfLastMonth;
  }
  if (period === 'last_3_months') {
    const past = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    return d >= past;
  }
  if (period === 'last_6_months') {
    const past = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    return d >= past;
  }
  if (period === 'last_12_months') {
    const past = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
    return d >= past;
  }
  if (period === 'custom') {
    if (startDate) {
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      if (d < s) return false;
    }
    if (endDate) {
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      if (d > e) return false;
    }
    return true;
  }
  return true;
}

export default function SubmissionsTable() {
  const { showToast } = useToast();
  const { admin: currentAdmin } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [statusCounts, setStatusCounts] = useState({ pending: 0, underReview: 0, reviewed: 0, mailSent: 0, total: 0 });
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0 });
  const [limit, setLimit] = useState(25);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [columnOrder, setColumnOrder] = useState(['user', 'service', 'country', 'dynamic', 'activity', 'submittedAt', 'status', 'reviewedBy', 'action']);
  const [draggedColId, setDraggedColId] = useState(null);

  // Analytics state (collapsed by default)
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsRange, setAnalyticsRange] = useState('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);

  const loadAnalytics = async (range = analyticsRange, sDate = customStartDate, eDate = customEndDate) => {
    setIsAnalyticsLoading(true);
    setAnalyticsError(null);
    try {
      const res = await fetchSubmissionAnalytics({ range, startDate: sDate, endDate: eDate });
      if (res.success && res.data) {
        setAnalyticsData(res.data);
      } else {
        setAnalyticsError(res.error || 'Unable to load analytics. Please try again.');
      }
    } catch (err) {
      setAnalyticsError('Unable to load analytics. Please try again.');
    } finally {
      setIsAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (showAnalytics && analyticsRange !== 'custom') {
      loadAnalytics(analyticsRange);
    }
  }, [showAnalytics, analyticsRange]);

  const handleApplyCustomDate = () => {
    if (!customStartDate || !customEndDate) {
      showToast('Please select both start and end dates', 'error');
      return;
    }
    loadAnalytics('custom', customStartDate, customEndDate);
  };

  const tableScrollRef = useRef(null);
  const scrollIntervalRef = useRef(null);
  const [showLeftNav, setShowLeftNav] = useState(false);
  const [showRightNav, setShowRightNav] = useState(false);

  const checkScrollState = () => {
    const el = tableScrollRef.current;
    if (!el) return;
    const canScrollLeft = el.scrollLeft > 5;
    const canScrollRight = el.scrollLeft < (el.scrollWidth - el.clientWidth - 5);
    setShowLeftNav(canScrollLeft);
    setShowRightNav(canScrollRight);
  };

  const startHoverScroll = (direction) => {
    stopHoverScroll();
    const speed = direction === 'right' ? 12 : -12;
    const scrollStep = () => {
      if (tableScrollRef.current) {
        tableScrollRef.current.scrollLeft += speed;
      }
      scrollIntervalRef.current = requestAnimationFrame(scrollStep);
    };
    scrollIntervalRef.current = requestAnimationFrame(scrollStep);
  };

  const stopHoverScroll = () => {
    if (scrollIntervalRef.current) {
      cancelAnimationFrame(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  useEffect(() => {
    const el = tableScrollRef.current;
    if (!el) return;
    checkScrollState();
    el.addEventListener('scroll', checkScrollState);
    window.addEventListener('resize', checkScrollState);
    return () => {
      el.removeEventListener('scroll', checkScrollState);
      window.removeEventListener('resize', checkScrollState);
      stopHoverScroll();
    };
  }, [submissions]);

  const loadSubmissions = async (page = 1, currentLimit = limit) => {
    setLoading(true);
    const res = await fetchAllSubmissions({
      page,
      limit: currentLimit,
      search: searchQuery
    });
    setLoading(false);

    if (res.success) {
      setSubmissions(res.data || []);
      if (res.statusCounts) {
        setStatusCounts(res.statusCounts);
      }
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } else {
      showToast(res.error || 'Failed to load submissions from server', 'error');
    }
  };

  useEffect(() => {
    loadSubmissions(1, limit);
  }, [limit]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadSubmissions(1);
  };

  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedReviewer, setSelectedReviewer] = useState('all');
  const [reviewerOptions, setReviewerOptions] = useState(['Unassigned']);
  const [isManagingReviewers, setIsManagingReviewers] = useState(false);
  const [newReviewerName, setNewReviewerName] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isLoadingAvailableUsers, setIsLoadingAvailableUsers] = useState(false);
  const [selectedUserToAdd, setSelectedUserToAdd] = useState('');

  const fetchAvailableUsers = async () => {
    try {
      setIsLoadingAvailableUsers(true);
      const apiBase = MANTRA_CONFIG.apiBaseUrl !== undefined && MANTRA_CONFIG.apiBaseUrl !== null ? MANTRA_CONFIG.apiBaseUrl : (import.meta.env.PROD ? '' : 'http://localhost:5000');
      
      let res = await fetch(`${apiBase}/api/users/non-reviewers`);
      let json = await res.json().catch(() => null);

      if (!json || !json.success || !Array.isArray(json.users) || json.users.length === 0) {
        res = await fetch(`${apiBase}/api/admin/available-users`);
        json = await res.json().catch(() => null);
      }

      if (!json || !json.success || !Array.isArray(json.users) || json.users.length === 0) {
        res = await fetch(`${apiBase}/api/submissions/admin/available-users`);
        json = await res.json().catch(() => null);
      }

      if (json && json.success && Array.isArray(json.users)) {
        setAvailableUsers(json.users);
      }
    } catch (err) {
      console.error('Error fetching available users:', err);
    } finally {
      setIsLoadingAvailableUsers(false);
    }
  };

  useEffect(() => {
    if (isManagingReviewers) {
      fetchAvailableUsers();
    }
  }, [isManagingReviewers]);

  // Custom Searchable Activity Selector state
  const [isActivityDropdownOpen, setIsActivityDropdownOpen] = useState(false);
  const [activitySearchTerm, setActivitySearchTerm] = useState('');
  const activityDropdownRef = useRef(null);

  // Custom Searchable Country Selector state
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const countryDropdownRef = useRef(null);

  // Time period filter state for Submission Portal
  const [selectedTimePeriod, setSelectedTimePeriod] = useState('all_time');
  const [tableCustomStartDate, setTableCustomStartDate] = useState('');
  const [tableCustomEndDate, setTableCustomEndDate] = useState('');
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] = useState(false);

  // Additional field filter states
  const [selectedService, setSelectedService] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedSkippedVideo, setSelectedSkippedVideo] = useState('all');

  // Filter visibility toggles (Allows admin to toggle on/off individual filter controls)
  const [filterVisibility, setFilterVisibility] = useState({
    date: true,
    status: true,
    activity: true,
    search: true,
    reviewer: true,
    service: false,
    country: false,
    skippedVideo: false
  });
  const [isFilterSettingsOpen, setIsFilterSettingsOpen] = useState(false);
  const filterSettingsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (activityDropdownRef.current && !activityDropdownRef.current.contains(e.target)) {
        setIsActivityDropdownOpen(false);
      }
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target)) {
        setIsCountryDropdownOpen(false);
      }
      if (filterSettingsRef.current && !filterSettingsRef.current.contains(e.target)) {
        setIsFilterSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch distinct submitted activities across all pages from DB
  const [dbActivities, setDbActivities] = useState([]);

  useEffect(() => {
    const loadDbActivities = async () => {
      try {
        const res = await fetchSubmissionActivities();
        if (res.success && Array.isArray(res.data)) {
          setDbActivities(res.data);
        }
      } catch (e) {
        console.error('[SubmissionsTable] Error loading DB activities:', e);
      }
    };
    loadDbActivities();
  }, []);

  // Fetch reviewers directly from DB table
  const loadReviewers = async () => {
    try {
      const res = await fetchAdminReviewers();
      if (res.success && Array.isArray(res.data)) {
        setReviewerOptions(res.data);
      }
    } catch (err) {
      console.error('[SubmissionsTable] Error loading reviewers:', err);
    }
  };

  useEffect(() => {
    loadReviewers();
  }, []);

  const handleAddReviewer = async (nameToAdd) => {
    const trimmed = nameToAdd ? nameToAdd.trim() : newReviewerName.trim();
    if (!trimmed) return;
    if (reviewerOptions.some(r => r.toLowerCase() === trimmed.toLowerCase())) {
      showToast(`Reviewer '${trimmed}' already exists`, 'info');
      return;
    }

    try {
      const res = await addAdminReviewer(trimmed);
      if (res.success && Array.isArray(res.data)) {
        setReviewerOptions(res.data);
      } else {
        setReviewerOptions(prev => [...prev, trimmed]);
      }
      setNewReviewerName('');
      showToast(`Added reviewer '${trimmed}'`, 'success');
    } catch (err) {
      console.error('Error adding reviewer:', err);
      showToast('Failed to add reviewer', 'error');
    }
  };

  const handleDeleteReviewer = async (nameToDelete) => {
    if (!nameToDelete || nameToDelete === 'Unassigned') {
      showToast('Cannot delete default Unassigned option', 'error');
      return;
    }

    try {
      // 1. Remove from options list locally immediately
      setReviewerOptions(prev => prev.filter(r => r.toLowerCase() !== nameToDelete.toLowerCase()));
      if (selectedReviewer.toLowerCase() === nameToDelete.toLowerCase()) {
        setSelectedReviewer('all');
      }

      // 2. Re-assign any submissions assigned to this deleted reviewer back to 'Unassigned' in state
      setSubmissions(prev => prev.map(s => (s.reviewed_by && s.reviewed_by.toLowerCase() === nameToDelete.toLowerCase()) ? { ...s, reviewed_by: 'Unassigned' } : s));

      // 3. Delete in DB and reset records in DB
      const res = await deleteAdminReviewer(nameToDelete);
      if (res.success && Array.isArray(res.data)) {
        setReviewerOptions(res.data);
      }

      showToast(`Deleted reviewer '${nameToDelete}'`, 'success');
    } catch (err) {
      console.error('Error deleting reviewer:', err);
      showToast('Failed to delete reviewer', 'error');
    }
  };

  const STATUS_CONFIG = {
    pending: { label: 'Pending', bg: '#fef3c7', border: '#fde68a', color: '#b45309' },
    under_review: { label: 'Under Review', bg: '#ffedd5', border: '#fed7aa', color: '#c2410c' },
    reviewed: { label: 'Reviewed', bg: '#dcfce7', border: '#bbf7d0', color: '#15803d' },
    mail_sent: { label: 'Mail Sent', bg: '#ffffff', border: '#cbd5e1', color: '#334155' },
  };

  const handleStatusChange = async (submissionId, newStatus) => {
    let prevSubmission = null;

    // Optimistic Real-Time UI Update (Instant response, zero full table reloads)
    setSubmissions(prev => prev.map(s => {
      if (s.id === submissionId) {
        prevSubmission = s;
        if (newStatus === 'pending') {
          return {
            ...s,
            status: 'pending',
            reviewed_by: 'Unassigned',
            reviewedBy: 'Unassigned',
            reviewed_by_user_id: null,
            reviewed_at: null
          };
        } else {
          const activeAdminName = currentAdmin?.name || currentAdmin?.email || 'Admin';
          const isCurrentlyUnassigned = !s.reviewed_by || s.reviewed_by === 'Unassigned';
          return {
            ...s,
            status: newStatus,
            reviewed_by: isCurrentlyUnassigned ? activeAdminName : s.reviewed_by,
            reviewedBy: isCurrentlyUnassigned ? activeAdminName : (s.reviewedBy || s.reviewed_by)
          };
        }
      }
      return s;
    }));

    showToast(`Status updated to '${STATUS_CONFIG[newStatus]?.label || newStatus}'`, 'success');

    // Background API Sync (No loading spinner or full table reload)
    try {
      const res = await reviewSubmissionStatus(submissionId, newStatus);
      if (res.success && res.data) {
        setSubmissions(prev => prev.map(s => s.id === submissionId ? { ...s, ...res.data } : s));
        loadReviewers();
      } else if (res.error) {
        showToast(res.error, 'error');
        if (prevSubmission) {
          setSubmissions(prev => prev.map(s => s.id === submissionId ? prevSubmission : s));
        }
      }
    } catch (err) {
      console.error('[SubmissionsTable] Error updating status:', err);
      showToast('Failed to sync status with server', 'error');
      if (prevSubmission) {
        setSubmissions(prev => prev.map(s => s.id === submissionId ? prevSubmission : s));
      }
    }
  };

  const handleClaimSubmission = async (submissionId) => {
    try {
      const apiBase = MANTRA_CONFIG.apiBaseUrl !== undefined && MANTRA_CONFIG.apiBaseUrl !== null 
        ? MANTRA_CONFIG.apiBaseUrl 
        : (import.meta.env.PROD ? '' : 'http://localhost:5000');

      const res = await fetch(`${apiBase}/api/activity-submissions/${submissionId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message || 'Submission claimed successfully', 'success');
        loadSubmissions(pagination.currentPage, limit);
      } else {
        showToast(json.error || 'Failed to claim submission', 'error');
      }
    } catch (err) {
      console.error('[SubmissionsTable] Error claiming submission:', err);
      showToast('Failed to claim submission', 'error');
    }
  };

  // Country & Video Filter Helper Functions
  const extractSubmissionCountry = (item) => {
    if (!item) return '';
    const data = item.form_data || item.submission_data || item.formData || item.submissionData || {};
    let raw = item.country || item.country_name || item.countryName || data.country || data.countryName || data.country_name || data.userCountry || data.location;
    if (raw && typeof raw === 'string' && raw.trim() && !['undefined', 'null', 'n/a'].includes(raw.trim().toLowerCase())) {
      const val = raw.trim();
      const matchedByCode = COUNTRY_LIST.find(c => c.code.toLowerCase() === val.toLowerCase());
      if (matchedByCode) return matchedByCode.name;
      return val;
    }
    const codeVal = item.country_code || item.countryCode || data.countryCode || data.country_code || data.dialCode;
    if (codeVal) {
      const codeStr = String(codeVal).trim();
      const matchedByCode = COUNTRY_LIST.find(c => c.code.toLowerCase() === codeStr.toLowerCase() || c.dialCode === codeStr);
      if (matchedByCode) return matchedByCode.name;
    }
    const phoneStr = data.phone || data.phoneNumber || item.phone || '';
    if (phoneStr && typeof phoneStr === 'string') {
      const trimmedPhone = phoneStr.trim();
      const matchedByDial = COUNTRY_LIST.find(c => trimmedPhone.startsWith(c.dialCode));
      if (matchedByDial) return matchedByDial.name;
    }
    return '';
  };

  const isVideoSkipped = (item) => {
    if (!item) return false;
    const data = item.form_data || item.submission_data || item.formData || item.submissionData || {};
    const subType = String(item.submission_type || item.submissionType || '').toLowerCase();
    const lessonId = String(item.lesson_id || item.lessonId || '').toLowerCase();
    const title = String(item.activity_title || item.activityTitle || '').toLowerCase();

    const isExplicitSkipped = (
      item.video_skipped === true ||
      item.video_skipped === 'true' ||
      item.skipped_video === true ||
      item.skipped === true ||
      subType === 'skipped_video' ||
      subType === 'no_video' ||
      subType === 'skipped' ||
      data.skippedVideo === true ||
      data.videoSkipped === true ||
      data.video_skipped === true ||
      data.skipped_video === true ||
      data.skipped === true ||
      data.videoStatus === 'skipped' ||
      data.video_status === 'skipped' ||
      item.video_url === 'skipped' ||
      data.video_url === 'skipped' ||
      data.videoUrl === 'skipped'
    );

    if (isExplicitSkipped) return true;

    // Check if this is Mantra intro video or related video activity
    const isVideoActivity = (
      lessonId.includes('mantra-intro-video') ||
      lessonId.includes('intro-video') ||
      lessonId.includes('market-yourself') ||
      lessonId.includes('grow-your-practice') ||
      title.includes('mantra intro video') ||
      title.includes('intro video') ||
      subType.includes('video')
    );

    if (isVideoActivity) {
      const rawVUrl = item.videoUrl || item.video_url || item.video || item.proof_url || item.proofUrl || data.videoUrl || data.video_url || data.videoLink || data.video || data.url || data.file || '';
      const cleanVUrl = normalizeImageUrl(rawVUrl);
      if (!cleanVUrl) {
        return true; // Provider opted to skip uploading video
      }
    }

    return false;
  };

  const extractProofImage = (sub) => {
    if (!sub) return null;
    const data = sub.form_data || sub.submission_data || sub.formData || sub.submissionData || {};
    let candidate = (
      sub.proof_url ||
      sub.proofUrl ||
      sub.image_url ||
      sub.imageUrl ||
      sub.screenshot_url ||
      sub.screenshotUrl ||
      sub.file_url ||
      sub.fileUrl ||
      sub.proof ||
      data.proof_url ||
      data.proofUrl ||
      data.image_url ||
      data.imageUrl ||
      data.screenshot_url ||
      data.screenshotUrl ||
      data.file_url ||
      data.fileUrl ||
      data.file ||
      data.proof ||
      data.url ||
      ''
    );
    if (!candidate || typeof candidate !== 'string') return null;
    candidate = candidate.trim().replace(/^['"]|['"]$/g, '');
    if (!candidate || candidate === 'null' || candidate === 'undefined' || candidate === 'none' || candidate === 'n/a') return null;
    if (candidate.startsWith('//')) candidate = 'https:' + candidate;
    return candidate;
  };

  const hasUploadedVideo = (item) => {
    if (!item) return false;
    if (isVideoSkipped(item)) return false;
    const data = item.form_data || item.submission_data || item.formData || item.submissionData || {};
    const subType = String(item.submission_type || item.submissionType || '').toLowerCase();
    const proofUrl = String(item.proof_url || data.videoUrl || data.video_url || data.fileUrl || data.url || '').toLowerCase();
    return (
      subType.includes('video') ||
      !!data.videoUrl ||
      !!data.video_url ||
      !!data.videoPublicId ||
      !!data.video_public_id ||
      !!data.video ||
      !!data.videoFilename ||
      proofUrl.endsWith('.mp4') ||
      proofUrl.endsWith('.webm') ||
      proofUrl.endsWith('.mov') ||
      proofUrl.includes('vimeo') ||
      proofUrl.includes('youtube') ||
      proofUrl.includes('cloudinary')
    );
  };

  // Filter submissions by selected date, activity, status, and reviewer
  const filteredSubmissions = submissions.filter(item => {
    // 0. Exclude entries where video was skipped
    if (isVideoSkipped(item)) {
      return false;
    }

    // 1. Time Period Filter
    if (filterVisibility.date && selectedTimePeriod !== 'all_time') {
      const itemDate = item.created_at || item.submitted_at || item.submittedAt;
      if (!isDateInPeriod(itemDate, selectedTimePeriod, tableCustomStartDate, tableCustomEndDate)) {
        return false;
      }
    }

    // 2. Activity Filter
    if (filterVisibility.activity && selectedActivity !== 'all') {
      const formattedTitle = formatActivityTitle(item.activity_title, item.lesson_id);
      if (item.lesson_id !== selectedActivity && item.activity_title !== selectedActivity && formattedTitle !== selectedActivity) {
        return false;
      }
    }

    // 3. Status Filter
    if (filterVisibility.status && selectedStatus !== 'all') {
      const itemStatus = (item.status || 'pending').toLowerCase();
      if (selectedStatus === 'reviewed' && (itemStatus === 'reviewed' || itemStatus === 'approved')) {
        // match
      } else if (itemStatus !== selectedStatus) {
        return false;
      }
    }

    // 4. Reviewer Filter
    if (filterVisibility.reviewer && selectedReviewer !== 'all') {
      const itemReviewer = item.reviewed_by || 'Unassigned';
      if (selectedReviewer === 'Unassigned' && (itemReviewer === 'Unassigned' || !item.reviewed_by)) {
        // match
      } else if (itemReviewer.toLowerCase() !== selectedReviewer.toLowerCase()) {
        return false;
      }
    }

    // 5. Service Filter
    if (filterVisibility.service && selectedService !== 'all') {
      const itemService = normalizeService(item.service || item.formData?.service || '');
      const normSelected = normalizeService(selectedService);
      if (itemService !== normSelected) {
        return false;
      }
    }

    // 6. Country Filter
    if (filterVisibility.country && selectedCountry !== 'all') {
      const itemCountry = extractSubmissionCountry(item);
      if (itemCountry.toLowerCase() !== selectedCountry.toLowerCase()) {
        return false;
      }
    }

    // 7. Skipped Video Filter
    if (filterVisibility.skippedVideo && selectedSkippedVideo !== 'all') {
      const skipped = isVideoSkipped(item);
      const uploaded = hasUploadedVideo(item);

      if (selectedSkippedVideo === 'skipped' && !skipped) {
        return false;
      }
      if (selectedSkippedVideo === 'uploaded' && !uploaded) {
        return false;
      }
    }

    return true;
  });

  // Extract unique countries ONLY for which rows are available
  const uniqueCountries = Array.from(new Set(
    submissions
      .map(extractSubmissionCountry)
      .filter(c => c && String(c).trim())
  )).sort();

  const filteredCountryOptions = uniqueCountries.filter(c =>
    c.toLowerCase().includes(countrySearchTerm.toLowerCase())
  );

  // Extract unique services
  const uniqueServices = Array.from(new Set(
    submissions
      .map(s => s.service || s.formData?.service)
      .filter(s => s && String(s).trim())
  ));

  // Extract unique activity options across registered activities, DB records & current page
  const uniqueActivitiesMap = new Map();

  // 1. Include all registered activities from mantra/activities.ts
  if (Array.isArray(registeredActivities)) {
    registeredActivities.forEach(item => {
      const titleVal = item.title || item.lessonId;
      const formattedTitle = formatActivityTitle(titleVal, item.lessonId);
      const key = item.lessonId || formattedTitle;
      if (formattedTitle && !uniqueActivitiesMap.has(formattedTitle)) {
        uniqueActivitiesMap.set(formattedTitle, { key, title: formattedTitle });
      }
    });
  }

  // 2. Include all distinct submitted activities fetched from entire DB across all pages
  if (Array.isArray(dbActivities)) {
    dbActivities.forEach(item => {
      const titleVal = item.title || item.activity_title || item.lesson_id;
      const formattedTitle = formatActivityTitle(titleVal, item.key || item.lesson_id);
      const key = item.key || item.lesson_id || formattedTitle;
      if (formattedTitle && !uniqueActivitiesMap.has(formattedTitle)) {
        uniqueActivitiesMap.set(formattedTitle, { key, title: formattedTitle });
      }
    });
  }

  // 3. Include any activity present in current page submissions
  submissions.forEach(s => {
    const formattedTitle = formatActivityTitle(s.activity_title, s.lesson_id);
    const key = s.lesson_id || s.activity_title || formattedTitle;
    if (key && !uniqueActivitiesMap.has(formattedTitle)) {
      uniqueActivitiesMap.set(formattedTitle, { key, title: formattedTitle });
    }
  });

  const availableActivities = Array.from(uniqueActivitiesMap.values());
  const filteredActivityOptions = availableActivities.filter(act =>
    act.title.toLowerCase().includes(activitySearchTerm.toLowerCase())
  );

  // Exclude redundant user info, P/V links & technical file upload metadata keys from main table
  const REDUNDANT_KEYS = [
    'fullName', 'name', 'email', 'phone', 'phoneNumber', 'phone_number', 'mobile', 'contact',
    'rawPhone', 'raw_phone', 'raw_phone_number', 'rawphone',
    'submittedAt', 'submitted_at', 'uploadedAt', 'uploaded_at', 'submitted_date', 'created_at', 'updated_at', 'service',
    'fileName', 'file_name',
    'fileSize', 'file_size', 'bytes',
    'fileType', 'file_type', 'format',
    'publicId', 'public_id',
    'screenshotUrl', 'imageUrl', 'url',
    'videoPublicId', 'country', 'countryCode', 'consent',
    'profileUrl', 'profile_url', 'videoUrl',
    'skippedVideo', 'skipped_video', 'videoSkipped', 'video_skipped', 'skipped'
  ];

  const PROOF_KEYS = ['screenshotUrl', 'imageUrl', 'url', 'file', 'proof'];

  const getDynamicFormKeys = () => {
    const keys = new Set();
    submissions.forEach(sub => {
      const data = sub.form_data || sub.submission_data || {};
      Object.keys(data).forEach(k => {
        const lowerK = k.toLowerCase();
        if (!REDUNDANT_KEYS.includes(k) && !lowerK.includes('rawphone') && !lowerK.includes('raw_phone') && !lowerK.includes('skippedvideo') && !lowerK.includes('skipped_video')) {
          keys.add(k);
        }
      });
    });
    const keysArr = Array.from(keys);
    const regularKeys = keysArr.filter(k => !PROOF_KEYS.includes(k));
    const proofKeys = keysArr.filter(k => PROOF_KEYS.includes(k));

    return [...regularKeys, ...proofKeys];
  };

  const dynamicKeys = getDynamicFormKeys();

  // Column Drag & Drop Reordering state (strictly local per user in browser localStorage)
  const [columns, setColumns] = useState([]);

  const STORAGE_KEY = 'mantra_submissions_table_column_order';

  useEffect(() => {
    const baseCols = [
      { id: 'user', label: 'User / Email', width: '16%' },
      { id: 'service', label: 'Service', width: '9%' },
      { id: 'country', label: 'Country', width: '10%' },
      ...dynamicKeys.map(k => ({ id: `dyn_${k}`, key: k, label: formatHeaderLabel(k) })),
      { id: 'activity', label: 'Activity', width: '14%' },
      { id: 'submittedAt', label: 'Submitted At', width: '13%' },
      { id: 'status', label: 'Status', width: '12%' },
      { id: 'reviewedBy', label: 'Reviewed By', width: '13%' },
      { id: 'action', label: 'Action', width: '8%', align: 'right' }
    ];

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const savedIds = JSON.parse(saved);
        if (Array.isArray(savedIds) && savedIds.length > 0) {
          const ordered = savedIds
            .map(id => baseCols.find(col => col.id === id))
            .filter(col => col && !col.id.toLowerCase().includes('rawphone') && !col.id.toLowerCase().includes('raw_phone') && !col.id.toLowerCase().includes('skippedvideo') && !col.id.toLowerCase().includes('skipped_video'));
          const missing = baseCols.filter(col => !savedIds.includes(col.id));
          setColumns([...ordered, ...missing]);
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to parse saved column layout:', err);
    }

    setColumns(baseCols);
  }, [submissions]);

  const [draggedColumnIndex, setDraggedColumnIndex] = useState(null);

  const handleColumnDragStart = (e, index) => {
    setDraggedColumnIndex(index);
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColumnDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleColumnDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndexStr = e.dataTransfer.getData('text/plain');
    const dragIndex = dragIndexStr !== '' ? Number(dragIndexStr) : draggedColumnIndex;
    if (dragIndex === null || dragIndex === dropIndex) {
      setDraggedColumnIndex(null);
      return;
    }
    const updated = [...columns];
    const [movedItem] = updated.splice(dragIndex, 1);
    updated.splice(dropIndex, 0, movedItem);
    setColumns(updated);
    setDraggedColumnIndex(null);

    // Save customized column layout strictly in local storage per user browser
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.map(c => c.id)));
    } catch (err) {
      console.warn('Failed to save local column layout:', err);
    }
  };

  const resetColumnLayout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) { }
    const defaultCols = [
      { id: 'user', label: 'User / Email', width: '16%' },
      { id: 'service', label: 'Service', width: '9%' },
      { id: 'country', label: 'Country', width: '10%' },
      ...dynamicKeys.map(k => ({ id: `dyn_${k}`, key: k, label: formatHeaderLabel(k) })),
      { id: 'activity', label: 'Activity', width: '14%' },
      { id: 'submittedAt', label: 'Submitted At', width: '13%' },
      { id: 'status', label: 'Status', width: '12%' },
      { id: 'reviewedBy', label: 'Reviewed By', width: '13%' },
      { id: 'action', label: 'Action', width: '8%', align: 'right' }
    ];
    setColumns(defaultCols);
  };

  const formatHeaderLabel = (key) => {
    if (key.toLowerCase() === 'city') return 'Country';
    if (key.toLowerCase() === 'country') return 'Country';
    if (key === 'videoUrl') return 'Video';
    if (PROOF_KEYS.includes(key)) return 'Uploaded Proof';
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const exportToCSV = () => {
    if (!filteredSubmissions || filteredSubmissions.length === 0) {
      showToast('No submission data available to export', 'error');
      return;
    }

    const headers = ['User Name', 'Email', 'Phone', 'Service', 'Status', 'Reviewed By', ...dynamicKeys.map(formatHeaderLabel), 'Activity Title', 'Submitted At'];
    const csvRows = [headers.join(',')];

    filteredSubmissions.forEach(item => {
      const data = item.form_data || item.submission_data || {};
      const fullName = data.fullName || data.name || item.user_id || '';
      const email = data.email || '';
      const phone = data.phone || data.phoneNumber || data.phone_number || data.mobile || '';
      const service = item.service || data.service || '';
      const statusLabel = STATUS_CONFIG[item.status || 'pending']?.label || item.status || 'Pending';
      const reviewer = item.reviewed_by || 'Unassigned';
      const activity = item.activity_title || '';
      const submittedAt = formatDate(item.created_at || data.submittedAt || data.uploadedAt);

      const formValues = dynamicKeys.map(key => {
        const val = data[key];
        if (!val) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      });

      const row = [
        `"${fullName.replace(/"/g, '""')}"`,
        `"${email.replace(/"/g, '""')}"`,
        `"${phone.replace(/"/g, '""')}"`,
        `"${service.replace(/"/g, '""')}"`,
        `"${statusLabel.replace(/"/g, '""')}"`,
        `"${reviewer.replace(/"/g, '""')}"`,
        ...formValues,
        `"${activity.replace(/"/g, '""')}"`,
        `"${submittedAt.replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });
    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `operations_activity_submissions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Exported Operations CSV successfully!', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>

      {/* Top Header Control Bar with View/Hide Analytics Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: '#ffffff',
        padding: '12px 18px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(15, 23, 42, 0.15)'
          }}>
            <FileSpreadsheet size={16} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.01em' }}>
              Form Submissions
            </h2>
            <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
              Provider activity responses & verification reviews
            </p>
          </div>
        </div>

        {/* Toggle Analytics Button */}
        <button
          onClick={() => setShowAnalytics(prev => !prev)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            border: showAnalytics ? '1px solid #cbd5e1' : '1px solid #2563eb',
            background: showAnalytics ? '#f8fafc' : '#2563eb',
            color: showAnalytics ? '#0f172a' : '#ffffff',
            fontSize: '0.78rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            boxShadow: showAnalytics ? 'none' : '0 2px 6px rgba(37, 99, 235, 0.25)'
          }}
        >
          <BarChart3 size={15} />
          <span>{showAnalytics ? 'Hide Analytics' : 'View Analytics'}</span>
          <ChevronRight size={14} style={{ transform: showAnalytics ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
        </button>
      </div>

      {/* ======================================================== */}
      {/* COLLAPSIBLE SECTION: ACTIVITY ANALYTICS                   */}
      {/* ======================================================== */}
      {showAnalytics && (
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)', animation: 'fadeIn 0.2s ease-in-out' }}>

          {/* Header & Date Range Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(15,23,42,0.15)' }}>
                <BarChart3 size={18} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.01em' }}>Activity Analytics</h2>
                <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Real-time completion & video submission behavior</p>
              </div>
            </div>

            {/* Date Selector Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '4px 8px' }}>
                <Calendar size={14} color="#64748b" />
                <select
                  value={analyticsRange}
                  onChange={(e) => setAnalyticsRange(e.target.value)}
                  style={{ border: 'none', background: 'transparent', fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="this_week">This Week</option>
                  <option value="this_month">This Month</option>
                  <option value="last_month">Last Month</option>
                  <option value="last_3_months">Last 3 Months</option>
                  <option value="last_6_months">Last 6 Months</option>
                  <option value="last_12_months">Last 12 Months</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {analyticsRange === 'custom' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.74rem', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800 }}>to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.74rem', fontWeight: 700 }}
                  />
                  <button
                    onClick={handleApplyCustomDate}
                    style={{ padding: '5px 12px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#ffffff', fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Apply
                  </button>
                </div>
              )}

              <button
                onClick={() => loadAnalytics()}
                title="Refresh Analytics"
                style={{ padding: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <RefreshCw size={14} color="#475569" className={isAnalyticsLoading ? 'spin-icon' : ''} />
              </button>
            </div>
          </div>

          {/* Loading / Error / Data state */}
          {isAnalyticsLoading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '0.84rem', fontWeight: 700 }}>
              Loading activity analytics...
            </div>
          ) : analyticsError ? (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px', textAlign: 'center', color: '#991b1b', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <span>Unable to load analytics. Please try again.</span>
              <button onClick={() => loadAnalytics()} style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: '#dc2626', color: '#ffffff', fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer' }}>Retry</button>
            </div>
          ) : (
            <>
              {/* Overview Cards (4 Compact Metrics) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '9px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Activity Completions</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>{analyticsData?.overview?.totalCompletions || 0}</div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '9px', background: '#f0fdf4', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Users size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Unique Providers</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>{analyticsData?.overview?.uniqueProviders || 0}</div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '9px', background: '#fae8ff', color: '#c026d3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Layers size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Activities Completed</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>{analyticsData?.overview?.activitiesCompleted || 0}</div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '9px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Video size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.66rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Video Submissions</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>{analyticsData?.overview?.videoSubmissions || 0}</div>
                  </div>
                </div>
              </div>

              {/* Detailed Analytics Grid: Completions + Video Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>

                {/* Card 1: Activity Completion Breakdown */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>ACTIVITY COMPLETIONS</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>Sorted by Highest</span>
                  </div>

                  {!analyticsData?.activityCompletions || analyticsData.activityCompletions.length === 0 ? (
                    <div style={{ padding: '24px 12px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700 }}>
                      No activity data for this period.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {analyticsData.activityCompletions.map((item, idx) => {
                        const maxCount = analyticsData.activityCompletions[0]?.count || 1;
                        const percent = Math.round((item.count / maxCount) * 100);
                        return (
                          <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>{formatActivityTitle(item.activityName, item.activityId)}</span>
                              <span style={{ fontSize: '0.84rem', fontWeight: 900, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '6px' }}>{item.count}</span>
                            </div>
                            <div style={{ width: '100%', height: '5px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)', borderRadius: '3px' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Card 2: Video Submission Breakdown */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>VIDEO SUBMISSION BREAKDOWN</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>Uploaded vs Skipped</span>
                  </div>

                  {!analyticsData?.videoSubmissions || analyticsData.videoSubmissions.length === 0 ? (
                    <div style={{ padding: '24px 12px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700 }}>
                      No video submission data for this period.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {analyticsData.videoSubmissions.map((vItem, idx) => {
                        const uploadPct = vItem.total > 0 ? Math.round((vItem.uploaded / vItem.total) * 100) : 0;
                        const skipPct = vItem.total > 0 ? Math.round((vItem.skipped / vItem.total) * 100) : 0;
                        return (
                          <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ fontSize: '0.84rem', fontWeight: 900, color: '#0f172a' }}>{formatActivityTitle(vItem.activityName, vItem.activityId)}</div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', textAlign: 'center', background: '#f8fafc', padding: '6px', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                              <div>
                                <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Total</div>
                                <div style={{ fontSize: '0.84rem', fontWeight: 900, color: '#0f172a' }}>{vItem.total}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase' }}>Uploaded</div>
                                <div style={{ fontSize: '0.84rem', fontWeight: 900, color: '#1d4ed8' }}>{vItem.uploaded}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase' }}>Skipped</div>
                                <div style={{ fontSize: '0.84rem', fontWeight: 900, color: '#b45309' }}>{vItem.skipped}</div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 800 }}>
                                <span style={{ color: '#2563eb' }}>Uploaded</span>
                                <span style={{ color: '#1d4ed8' }}>{uploadPct}% ({vItem.uploaded})</span>
                              </div>
                              <div style={{ width: '100%', height: '6px', background: '#eff6ff', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${uploadPct}%`, height: '100%', background: '#2563eb', borderRadius: '3px' }} />
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 800, marginTop: '2px' }}>
                                <span style={{ color: '#d97706' }}>Skipped</span>
                                <span style={{ color: '#b45309' }}>{skipPct}% ({vItem.skipped})</span>
                              </div>
                              <div style={{ width: '100%', height: '6px', background: '#fffbe8', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${skipPct}%`, height: '100%', background: '#f59e0b', borderRadius: '3px' }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </>
          )}
        </div>
      )}

      {/* Top Status Metrics Cards (Ultra-Compact) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>

        {/* Metric 1: Pending */}
        <div style={{ background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Clock size={13} color="#b45309" />
          </div>
          <div>
            <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Pending</div>
            <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#92400e', lineHeight: 1, marginTop: '1px' }}>{statusCounts.pending}</div>
          </div>
        </div>

        {/* Metric 2: Under Review */}
        <div style={{ background: '#fff7ed', borderRadius: '8px', border: '1px solid #fed7aa', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Eye size={13} color="#c2410c" />
          </div>
          <div>
            <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Under Review</div>
            <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#9a3412', lineHeight: 1, marginTop: '1px' }}>{statusCounts.underReview}</div>
          </div>
        </div>

        {/* Metric 3: Reviewed */}
        <div style={{ background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CheckCircle2 size={13} color="#15803d" />
          </div>
          <div>
            <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Reviewed</div>
            <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#166534', lineHeight: 1, marginTop: '1px' }}>{statusCounts.reviewed}</div>
          </div>
        </div>

        {/* Metric 4: Mail Sent */}
        <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Mail size={13} color="#334155" />
          </div>
          <div>
            <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Mail Sent</div>
            <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#0f172a', lineHeight: 1, marginTop: '1px' }}>{statusCounts.mailSent}</div>
          </div>
        </div>

      </div>

      {/* Sleek Action & Filter Bar (Compact Height) */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '10px',
        background: '#ffffff',
        padding: '10px 16px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(37, 99, 235, 0.2)'
          }}>
            <FileSpreadsheet size={15} style={{ display: 'block', margin: 'auto' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
              Submission Portal
            </h3>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0px' }}>
              Showing <strong style={{ color: '#2563eb' }}>{filteredSubmissions.length}</strong> records
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>

          {/* Time Period Filter */}
          {filterVisibility.date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', padding: '4px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', maxWidth: '160px' }}>
              <Calendar size={12} color="#64748b" style={{ flexShrink: 0 }} />
              <select
                value={selectedTimePeriod}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedTimePeriod(val);
                  if (val === 'custom') {
                    setIsCustomDateModalOpen(true);
                  }
                }}
                style={{ border: 'none', background: 'transparent', fontSize: '0.76rem', color: '#1e293b', fontWeight: 700, outline: 'none', cursor: 'pointer', maxWidth: '130px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}
              >
                <option value="all_time">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this_week">This Week</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="last_3_months">Last 3 Months</option>
                <option value="last_6_months">Last 6 Months</option>
                <option value="last_12_months">Last 12 Months</option>
                <option value="custom">Custom Range...</option>
              </select>
            </div>
          )}

          {/* Status Filter */}
          {filterVisibility.status && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', padding: '4px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', maxWidth: '140px' }}>
              <Filter size={12} color="#64748b" style={{ flexShrink: 0 }} />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontSize: '0.76rem', color: '#1e293b', fontWeight: 700, outline: 'none', cursor: 'pointer', maxWidth: '110px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="reviewed">Reviewed</option>
                <option value="mail_sent">Mail Sent</option>
              </select>
            </div>
          )}

          {/* Reviewed By Filter */}
          {filterVisibility.reviewer && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', padding: '4px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', maxWidth: '150px' }}>
              <User size={12} color="#64748b" style={{ flexShrink: 0 }} />
              <select
                value={selectedReviewer}
                onChange={(e) => {
                  if (e.target.value === '__MANAGE__') {
                    setIsManagingReviewers(true);
                  } else {
                    setSelectedReviewer(e.target.value);
                  }
                }}
                style={{ border: 'none', background: 'transparent', fontSize: '0.76rem', color: '#1e293b', fontWeight: 700, outline: 'none', cursor: 'pointer', maxWidth: '120px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}
              >
                <option value="all">All Reviewers</option>
                {reviewerOptions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
                <option value="__MANAGE__">⚙️ Manage Reviewers...</option>
              </select>
            </div>
          )}

          {/* Custom Searchable Activity Selector */}
          {filterVisibility.activity && (
            <div ref={activityDropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => {
                  setIsActivityDropdownOpen(prev => !prev);
                  setActivitySearchTerm('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f8fafc',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  fontSize: '0.76rem',
                  color: '#1e293b',
                  fontWeight: 700,
                  maxWidth: '220px',
                  outline: 'none'
                }}
              >
                <Layers size={12} color="#64748b" style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                  {selectedActivity === 'all' ? 'All Activities' : selectedActivity}
                </span>
                <ChevronRight size={12} color="#64748b" style={{ transform: isActivityDropdownOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease', flexShrink: 0 }} />
              </button>

              {/* Dropdown Menu Card */}
              {isActivityDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '6px',
                    width: '280px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                    zIndex: 99999,
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                  className="animate-fade-in"
                >
                  {/* Search Bar inside Selector */}
                  <div style={{ position: 'relative', width: '100%' }}>
                    <Search size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Search activities..."
                      value={activitySearchTerm}
                      onChange={(e) => setActivitySearchTerm(e.target.value)}
                      autoFocus
                      style={{
                        width: '100%',
                        height: '30px',
                        padding: '0 10px 0 28px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.74rem',
                        outline: 'none',
                        background: '#f8fafc',
                        color: '#0f172a',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Options List */}
                  <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {/* Option: All Activities */}
                    <div
                      onClick={() => {
                        setSelectedActivity('all');
                        setIsActivityDropdownOpen(false);
                      }}
                      style={{
                        padding: '7px 10px',
                        borderRadius: '6px',
                        fontSize: '0.76rem',
                        fontWeight: selectedActivity === 'all' ? 900 : 700,
                        background: selectedActivity === 'all' ? '#eff6ff' : 'transparent',
                        color: selectedActivity === 'all' ? '#2563eb' : '#334155',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={(e) => { if (selectedActivity !== 'all') e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={(e) => { if (selectedActivity !== 'all') e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span>All Activities</span>
                      {selectedActivity === 'all' && <CheckCircle2 size={13} color="#2563eb" />}
                    </div>

                    {/* Filtered Activity Options */}
                    {filteredActivityOptions.length === 0 ? (
                      <div style={{ padding: '12px 10px', fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center', fontWeight: 600 }}>
                        No available activities found
                      </div>
                    ) : (
                      filteredActivityOptions.map(act => {
                        const isSelected = selectedActivity === act.title;
                        return (
                          <div
                            key={act.title}
                            onClick={() => {
                              setSelectedActivity(act.title);
                              setIsActivityDropdownOpen(false);
                            }}
                            style={{
                              padding: '7px 10px',
                              borderRadius: '6px',
                              fontSize: '0.76rem',
                              fontWeight: isSelected ? 900 : 700,
                              background: isSelected ? '#eff6ff' : 'transparent',
                              color: isSelected ? '#2563eb' : '#334155',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '8px'
                            }}
                            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#f8fafc'; }}
                            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                          >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.title}</span>
                            {isSelected && <CheckCircle2 size={13} color="#2563eb" style={{ flexShrink: 0 }} />}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Service Filter */}
          {filterVisibility.service && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', padding: '4px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', maxWidth: '140px' }}>
              <Sparkles size={12} color="#64748b" style={{ flexShrink: 0 }} />
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                style={{ border: 'none', background: 'transparent', fontSize: '0.76rem', color: '#1e293b', fontWeight: 700, outline: 'none', cursor: 'pointer', maxWidth: '110px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}
              >
                <option value="all">All Services</option>
                {uniqueServices.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {/* Custom Searchable Country Selector */}
          {filterVisibility.country && (
            <div ref={countryDropdownRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => {
                  setIsCountryDropdownOpen(!isCountryDropdownOpen);
                  setCountrySearchTerm('');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#f8fafc',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  color: '#1e293b',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  maxWidth: '180px',
                  outline: 'none'
                }}
              >
                <ExternalLink size={12} color="#64748b" style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
                  {selectedCountry === 'all' ? 'All Countries' : selectedCountry}
                </span>
                <ChevronRight size={12} color="#64748b" style={{ transform: isCountryDropdownOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease', flexShrink: 0 }} />
              </button>

              {/* Dropdown Menu Card */}
              {isCountryDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '6px',
                    width: '240px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                    zIndex: 99999,
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                  className="animate-fade-in"
                >
                  {/* Search Bar inside Selector */}
                  <div style={{ position: 'relative', width: '100%' }}>
                    <Search size={12} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Search country..."
                      value={countrySearchTerm}
                      onChange={(e) => setCountrySearchTerm(e.target.value)}
                      autoFocus
                      style={{
                        width: '100%',
                        height: '30px',
                        padding: '0 10px 0 28px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.74rem',
                        outline: 'none',
                        background: '#f8fafc',
                        color: '#0f172a',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Options List */}
                  <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {/* Option: All Countries */}
                    <div
                      onClick={() => {
                        setSelectedCountry('all');
                        setIsCountryDropdownOpen(false);
                      }}
                      style={{
                        padding: '7px 10px',
                        borderRadius: '6px',
                        fontSize: '0.76rem',
                        fontWeight: selectedCountry === 'all' ? 900 : 700,
                        background: selectedCountry === 'all' ? '#eff6ff' : 'transparent',
                        color: selectedCountry === 'all' ? '#2563eb' : '#334155',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                      onMouseEnter={(e) => { if (selectedCountry !== 'all') e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={(e) => { if (selectedCountry !== 'all') e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span>All Countries</span>
                      {selectedCountry === 'all' && <CheckCircle2 size={13} color="#2563eb" />}
                    </div>

                    {/* Filtered Country Options */}
                    {filteredCountryOptions.length === 0 ? (
                      <div style={{ padding: '12px 10px', fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center', fontWeight: 600 }}>
                        No countries available
                      </div>
                    ) : (
                      filteredCountryOptions.map((c) => {
                        const isSelected = selectedCountry.toLowerCase() === c.toLowerCase();
                        return (
                          <div
                            key={c}
                            onClick={() => {
                              setSelectedCountry(c);
                              setIsCountryDropdownOpen(false);
                            }}
                            style={{
                              padding: '7px 10px',
                              borderRadius: '6px',
                              fontSize: '0.76rem',
                              fontWeight: isSelected ? 900 : 700,
                              background: isSelected ? '#eff6ff' : 'transparent',
                              color: isSelected ? '#2563eb' : '#334155',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#f8fafc'; }}
                            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                          >
                            <span>{c}</span>
                            {isSelected && <CheckCircle2 size={13} color="#2563eb" />}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search Input */}
          {filterVisibility.search && (
            <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '130px' }}>
              <Search size={12} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '28px',
                  padding: '0 8px 0 24px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.76rem',
                  outline: 'none',
                  background: '#f8fafc',
                  color: '#0f172a'
                }}
              />
            </form>
          )}

          {/* Filter Field Visibility Toggles Popover */}
          <div ref={filterSettingsRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsFilterSettingsOpen(prev => !prev)}
              title="Toggle filter fields visibility"
              style={{
                height: '28px',
                padding: '0 8px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: isFilterSettingsOpen ? '#eff6ff' : '#ffffff',
                color: isFilterSettingsOpen ? '#2563eb' : '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.74rem',
                fontWeight: 800
              }}
            >
              <Sparkles size={12} color={isFilterSettingsOpen ? '#2563eb' : '#64748b'} />
              <span>Filters</span>
            </button>

            {/* Filter Toggle Menu Card */}
            {isFilterSettingsOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '6px',
                  width: '210px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                  zIndex: 99999,
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
                className="animate-fade-in"
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Toggle Filter Visibility
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: '#1e293b', fontWeight: 700, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={filterVisibility.date}
                      onChange={(e) => setFilterVisibility(prev => ({ ...prev, date: e.target.checked }))}
                    />
                    <span>Time Period</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: '#1e293b', fontWeight: 700, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={filterVisibility.status}
                      onChange={(e) => setFilterVisibility(prev => ({ ...prev, status: e.target.checked }))}
                    />
                    <span>Status Filter</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: '#1e293b', fontWeight: 700, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={filterVisibility.reviewer}
                      onChange={(e) => setFilterVisibility(prev => ({ ...prev, reviewer: e.target.checked }))}
                    />
                    <span>Reviewer Filter</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: '#1e293b', fontWeight: 700, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={filterVisibility.activity}
                      onChange={(e) => setFilterVisibility(prev => ({ ...prev, activity: e.target.checked }))}
                    />
                    <span>Activity Filter</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: '#1e293b', fontWeight: 700, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={filterVisibility.service}
                      onChange={(e) => setFilterVisibility(prev => ({ ...prev, service: e.target.checked }))}
                    />
                    <span>Service Filter</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: '#1e293b', fontWeight: 700, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={filterVisibility.country}
                      onChange={(e) => setFilterVisibility(prev => ({ ...prev, country: e.target.checked }))}
                    />
                    <span>Country Filter</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: '#1e293b', fontWeight: 700, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={filterVisibility.search}
                      onChange={(e) => setFilterVisibility(prev => ({ ...prev, search: e.target.checked }))}
                    />
                    <span>Search Input</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => loadSubmissions(pagination.currentPage)}
            disabled={loading}
            style={{
              height: '28px',
              padding: '0 10px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.76rem',
              fontWeight: 700
            }}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          {/* Export Button (Super Admin Only) */}
          {(currentAdmin?.role === 'super_admin' || currentAdmin?.role === 'Super Admin') && (
            <button
              onClick={exportToCSV}
              style={{
                height: '28px',
                padding: '0 12px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.76rem',
                fontWeight: 800,
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
              }}
            >
              <Download size={12} /> Export CSV
            </button>
          )}

        </div>

      </div>

      {/* Main Operations Table (Compact Rows with Hover Scroll Navigators) */}
      <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', background: '#ffffff' }}>

        {/* Hover Scroll Navigator - LEFT */}
        <div
          onMouseEnter={() => startHoverScroll('left')}
          onMouseLeave={stopHoverScroll}
          onClick={() => {
            if (tableScrollRef.current) tableScrollRef.current.scrollBy({ left: -450, behavior: 'smooth' });
          }}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '44px',
            zIndex: 20,
            display: showLeftNav ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'flex-start',
            background: 'linear-gradient(to right, rgba(241,245,249,0.85) 0%, rgba(241,245,249,0) 100%)',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease',
            pointerEvents: 'auto'
          }}
          title="Hover or Click to Scroll Left"
        >
          <div
            style={{
              width: '38px',
              height: '64px',
              borderTopRightRadius: '32px',
              borderBottomRightRadius: '32px',
              background: 'rgba(226, 232, 240, 0.9)',
              backdropFilter: 'blur(4px)',
              boxShadow: '2px 0 8px rgba(0,0,0,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#334155',
              transition: 'all 0.15s ease'
            }}
          >
            <ChevronRight size={22} style={{ transform: 'rotate(180deg)', strokeWidth: 3 }} />
          </div>
        </div>

        {/* Hover Scroll Navigator - RIGHT */}
        <div
          onMouseEnter={() => startHoverScroll('right')}
          onMouseLeave={stopHoverScroll}
          onClick={() => {
            if (tableScrollRef.current) tableScrollRef.current.scrollBy({ left: 450, behavior: 'smooth' });
          }}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '44px',
            zIndex: 20,
            display: showRightNav ? 'flex' : 'none',
            alignItems: 'center',
            justifyContent: 'flex-end',
            background: 'linear-gradient(to left, rgba(241,245,249,0.85) 0%, rgba(241,245,249,0) 100%)',
            cursor: 'pointer',
            transition: 'opacity 0.2s ease',
            pointerEvents: 'auto'
          }}
          title="Hover or Click to Scroll Right"
        >
          <div
            style={{
              width: '38px',
              height: '64px',
              borderTopLeftRadius: '32px',
              borderBottomLeftRadius: '32px',
              background: 'rgba(226, 232, 240, 0.9)',
              backdropFilter: 'blur(4px)',
              boxShadow: '-2px 0 8px rgba(0,0,0,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#334155',
              transition: 'all 0.15s ease'
            }}
          >
            <ChevronRight size={22} style={{ strokeWidth: 3 }} />
          </div>
        </div>

        <div ref={tableScrollRef} style={{ overflowX: 'auto', scrollBehavior: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.76rem' }}>
            <thead>
              <tr style={{ background: '#043263', borderBottom: '1px solid #03254c', color: '#ffffff', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.66rem', letterSpacing: '0.04em' }}>
                {columns.map((col, index) => (
                  <th
                    key={col.id}
                    draggable
                    onDragStart={(e) => handleColumnDragStart(e, index)}
                    onDragOver={handleColumnDragOver}
                    onDrop={(e) => handleColumnDrop(e, index)}
                    onDragEnd={() => setDraggedColumnIndex(null)}
                    style={{
                      padding: '6px 10px',
                      width: col.width || 'auto',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      cursor: 'grab',
                      userSelect: 'none',
                      textAlign: col.align || 'left',
                      background: draggedColumnIndex === index ? '#1e4ed8' : 'transparent',
                      borderLeft: draggedColumnIndex === index ? '2px solid #60a5fa' : 'none',
                      transition: 'background 0.15s ease'
                    }}
                    title="Drag left or right to reorder column position"
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ opacity: 0.6, fontSize: '0.65rem', cursor: 'grab' }}>⋮⋮</span>
                      {col.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} style={{ textAlign: 'center', padding: '24px 12px', color: '#64748b' }}>
                    <RefreshCw size={18} style={{ margin: '0 auto 6px', color: '#2563eb' }} className="animate-spin" />
                    <div style={{ fontWeight: 600, fontSize: '0.76rem' }}>Loading operations data...</div>
                  </td>
                </tr>
              ) : filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} style={{ textAlign: 'center', padding: '28px 12px', color: '#64748b' }}>
                    <FileSpreadsheet size={26} style={{ margin: '0 auto 6px', color: '#cbd5e1' }} />
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem' }}>No Submissions Found</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Try adjusting your filters or search terms</div>
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((item) => {
                  const data = item.form_data || item.submission_data || {};
                  const fullName = data.fullName || data.name || item.user_id;
                  const email = data.email;
                  const country = extractSubmissionCountry(item) || data.country || data.countryName || 'United States';
                  const currentStatus = (item.status || 'pending').toLowerCase();
                  const statusStyle = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending;
                  const currentReviewer = item.reviewed_by || 'Unassigned';

                  return (
                    <tr
                      key={item.id}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      {columns.map(col => {
                        if (col.id === 'user') {
                          return (
                            <td key={col.id} style={{ padding: '6px 10px', verticalAlign: 'middle', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={`${fullName} (${email || ''})`}>
                              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.76rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fullName}</div>
                              {email && <div style={{ fontSize: '0.66rem', color: '#64748b', marginTop: '0px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</div>}
                            </td>
                          );
                        }

                        if (col.id === 'service') {
                          return (
                            <td key={col.id} style={{ padding: '6px 10px', verticalAlign: 'middle', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.service ? (
                                <span style={{
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                                  color: '#7e22ce',
                                  border: '1px solid #e9d5ff',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  textTransform: 'capitalize',
                                  display: 'inline-block'
                                }}>
                                  {item.service}
                                </span>
                              ) : (
                                <span style={{ color: '#cbd5e1', fontSize: '0.72rem' }}>—</span>
                              )}
                            </td>
                          );
                        }

                        if (col.id === 'country') {
                          return (
                            <td key={col.id} style={{ padding: '6px 10px', verticalAlign: 'middle', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#334155' }}>
                                {country}
                              </span>
                            </td>
                          );
                        }

                        if (col.id.startsWith('dyn_')) {
                          const key = col.key;
                          const val = data[key];
                          const isImage = PROOF_KEYS.includes(key);

                          if (isImage && val) {
                            const isVideo = key === 'videoUrl' || (typeof val === 'string' && (val.includes('/video/') || val.endsWith('.mp4') || val.endsWith('.webm')));
                            return (
                              <td key={col.id} style={{ padding: '6px 10px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                                {isVideo ? (
                                  <a
                                    href={val}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      border: '1px solid #bfdbfe',
                                      background: '#eff6ff',
                                      color: '#2563eb',
                                      fontSize: '0.68rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px',
                                      textDecoration: 'none'
                                    }}
                                  >
                                    <ExternalLink size={11} /> Video
                                  </a>
                                ) : (
                                  <button
                                    onClick={() => setPreviewImage(val)}
                                    style={{
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      border: '1px solid #e9d5ff',
                                      background: '#faf5ff',
                                      color: '#7e22ce',
                                      fontSize: '0.68rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px'
                                    }}
                                  >
                                    <Image size={11} /> Proof
                                  </button>
                                )}
                              </td>
                            );
                          }

                          return (
                            <td key={col.id} style={{ padding: '6px 10px', verticalAlign: 'middle', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={String(val || '')}>
                              {val !== undefined && val !== null && val !== '' ? (
                                <span style={{ color: '#334155', fontWeight: 600 }}>{String(val)}</span>
                              ) : (
                                <span style={{ color: '#cbd5e1' }}>—</span>
                              )}
                            </td>
                          );
                        }

                        if (col.id === 'activity') {
                          return (
                            <td key={col.id} style={{ padding: '6px 10px', verticalAlign: 'middle', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={formatActivityTitle(item.activity_title, item.lesson_id)}>
                              <div style={{ fontSize: '0.74rem', fontWeight: 600, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {(item.activity_title === 'TherapyMantra' || item.lesson_id === 'grow-your-practice' || item.lesson_id === 'market-yourself' || item.activity_title?.toLowerCase().includes('therapymantra')) ? (
                                  <a
                                    href={`/provider_pathways_dashboard_v3/task/market-yourself/${encodeURIComponent(item.service || 'therapy')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 700 }}
                                  >
                                    {formatActivityTitle(item.activity_title, item.lesson_id)}
                                  </a>
                                ) : (
                                  formatActivityTitle(item.activity_title, item.lesson_id)
                                )}
                              </div>
                            </td>
                          );
                        }

                        if (col.id === 'submittedAt') {
                          return (
                            <td key={col.id} style={{ padding: '6px 10px', verticalAlign: 'middle', whiteSpace: 'nowrap', fontSize: '0.74rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {formatDate(item.created_at || data.submittedAt || data.uploadedAt)}
                            </td>
                          );
                        }

                        if (col.id === 'status') {
                          return (
                            <td key={col.id} style={{ padding: '6px 8px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                              <select
                                value={currentStatus === 'approved' ? 'reviewed' : currentStatus}
                                onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                style={{
                                  padding: '2px 6px',
                                  borderRadius: '6px',
                                  border: `1px solid ${statusStyle.border}`,
                                  background: statusStyle.bg,
                                  color: statusStyle.color,
                                  fontWeight: 800,
                                  fontSize: '0.70rem',
                                  cursor: 'pointer',
                                  outline: 'none',
                                  width: '100%',
                                  minWidth: '105px'
                                }}
                              >
                                <option value="pending">Pending</option>
                                <option value="under_review">Under Review</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="mail_sent">Mail Sent</option>
                              </select>
                            </td>
                          );
                        }

                        if (col.id === 'reviewedBy') {
                          const isAssigned = currentReviewer && currentReviewer !== 'Unassigned';
                          const reviewerDisplayName = isAssigned ? (item.reviewer_name || currentReviewer) : 'Unassigned';

                          return (
                            <td key={col.id} style={{ padding: '6px 8px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                              <span
                                style={{
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  border: isAssigned ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                                  background: isAssigned ? '#eff6ff' : '#f8fafc',
                                  color: isAssigned ? '#1d4ed8' : '#64748b',
                                  fontWeight: 700,
                                  fontSize: '0.70rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                {reviewerDisplayName}
                              </span>
                            </td>
                          );
                        }

                        if (col.id === 'action') {
                          return (
                            <td key={col.id} style={{ padding: '6px 10px', verticalAlign: 'middle', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <button
                                onClick={() => setSelectedSubmission(item)}
                                style={{
                                  padding: '3px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  background: '#ffffff',
                                  color: '#2563eb',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '2px'
                                }}
                              >
                                View <ChevronRight size={11} />
                              </button>
                            </td>
                          );
                        }

                        return null;
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          {/* Items Per Page Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.76rem', color: '#475569', fontWeight: 600 }}>
            <span>Rows per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                const newLimit = Number(e.target.value);
                setLimit(newLimit);
                loadSubmissions(1, newLimit);
              }}
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f172a',
                fontSize: '0.76rem',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value={25}>25 records</option>
              <option value={50}>50 records</option>
              <option value={100}>100 records</option>
            </select>
          </div>

          {/* Page Information & Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
              Page <strong style={{ color: '#0f172a' }}>{pagination.currentPage || 1}</strong> of <strong style={{ color: '#0f172a' }}>{pagination.totalPages || 1}</strong>
              {pagination.totalRecords ? ` (${pagination.totalRecords} total records)` : ''}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => loadSubmissions(1)}
                disabled={loading || (pagination.currentPage || 1) <= 1}
                title="First Page"
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: (pagination.currentPage || 1) <= 1 ? '#f1f5f9' : '#ffffff',
                  color: (pagination.currentPage || 1) <= 1 ? '#94a3b8' : '#334155',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: (pagination.currentPage || 1) <= 1 ? 'not-allowed' : 'pointer'
                }}
              >
                «
              </button>

              <button
                onClick={() => loadSubmissions((pagination.currentPage || 1) - 1)}
                disabled={loading || (pagination.currentPage || 1) <= 1}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: (pagination.currentPage || 1) <= 1 ? '#f1f5f9' : '#ffffff',
                  color: (pagination.currentPage || 1) <= 1 ? '#94a3b8' : '#334155',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: (pagination.currentPage || 1) <= 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>

              <button
                onClick={() => loadSubmissions((pagination.currentPage || 1) + 1)}
                disabled={loading || (pagination.currentPage || 1) >= (pagination.totalPages || 1)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: (pagination.currentPage || 1) >= (pagination.totalPages || 1) ? '#f1f5f9' : '#ffffff',
                  color: (pagination.currentPage || 1) >= (pagination.totalPages || 1) ? '#94a3b8' : '#334155',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: (pagination.currentPage || 1) >= (pagination.totalPages || 1) ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>

              <button
                onClick={() => loadSubmissions(pagination.totalPages || 1)}
                disabled={loading || (pagination.currentPage || 1) >= (pagination.totalPages || 1)}
                title="Last Page"
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: (pagination.currentPage || 1) >= (pagination.totalPages || 1) ? '#f1f5f9' : '#ffffff',
                  color: (pagination.currentPage || 1) >= (pagination.totalPages || 1) ? '#94a3b8' : '#334155',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: (pagination.currentPage || 1) >= (pagination.totalPages || 1) ? 'not-allowed' : 'pointer'
                }}
              >
                »
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Interactive Zoom & Drag Image Proof Viewer */}
      {previewImage && (
        <InteractiveImageModal
          imageUrl={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}

      {/* MODAL 2: Premium Centered Screen Record Popup Portal */}
      {selectedSubmission && ReactDOM.createPortal(
        <div
          onClick={() => setSelectedSubmission(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999999,
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              padding: '0',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.4)',
              border: '1px solid #e2e8f0',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Gradient Top Accent Bar */}
            <div style={{ height: '4px', background: 'linear-gradient(90deg, #2563eb, #7c3aed, #ec4899)' }}></div>

            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={16} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                    Submission Details
                  </h3>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '1px' }}>
                    ID: #{String(selectedSubmission.id).slice(-8)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.15s' }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px 20px', background: '#fcfcfd' }}>

              {/* Card 1: User Profile Header Card */}
              {(() => {
                const data = selectedSubmission.form_data || selectedSubmission.submission_data || {};
                const fullName = data.fullName || data.name || selectedSubmission.user_id || 'User';
                const email = data.email || '';
                const phone = data.phone || data.phoneNumber || data.phone_number || data.mobile || data.contact || '';
                const submittedDate = formatDate(selectedSubmission.created_at || data.submittedAt || data.uploadedAt);
                const currentStatus = (selectedSubmission.status || 'pending').toLowerCase();
                const statusStyle = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending;
                const reviewer = selectedSubmission.reviewed_by || 'Unassigned';
                const initials = fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

                return (
                  <>
                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '14px 16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', color: '#1d4ed8', fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #bfdbfe', flexShrink: 0 }}>
                          {initials}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {fullName}
                          </h4>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '4px', fontSize: '0.76rem', color: '#475569' }}>
                            {email && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563eb', fontWeight: 600 }}>
                                <Mail size={12} color="#3b82f6" /> {email}
                              </span>
                            )}
                            {phone && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#334155', fontWeight: 600 }}>
                                <Phone size={12} color="#64748b" /> {phone}
                              </span>
                            )}
                          </div>
                        </div>
                        {selectedSubmission.service && (
                          <span style={{ padding: '3px 10px', borderRadius: '6px', background: '#faf5ff', color: '#7e22ce', border: '1px solid #e9d5ff', fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize' }}>
                            {selectedSubmission.service}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card 2: Activity & Review Status Details */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>

                      <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.64rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Activity Name</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginTop: '3px' }}>
                          {formatActivityTitle(selectedSubmission.activity_title, selectedSubmission.lesson_id)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={11} /> {submittedDate}
                        </div>
                      </div>

                      <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status:</span>
                          <span style={{ padding: '2px 8px', borderRadius: '6px', border: `1px solid ${statusStyle.border}`, background: statusStyle.bg, color: statusStyle.color, fontWeight: 800, fontSize: '0.72rem' }}>
                            {statusStyle.label}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Reviewed By:</span>
                          <span style={{ padding: '2px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: reviewer !== 'Unassigned' ? '#eff6ff' : '#f8fafc', color: reviewer !== 'Unassigned' ? '#1d4ed8' : '#64748b', fontWeight: 700, fontSize: '0.72rem' }}>
                            {selectedSubmission.reviewer_name || reviewer}
                          </span>
                        </div>
                        {selectedSubmission.reviewed_at && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Reviewed At:</span>
                            <span style={{ fontSize: '0.70rem', fontWeight: 600, color: '#0f172a' }}>
                              {formatDate(selectedSubmission.reviewed_at)}
                            </span>
                          </div>
                        )}
                        {(() => {
                          const rawV = selectedSubmission.videoUrl || selectedSubmission.video_url || selectedSubmission.video || data.videoUrl || data.video_url || data.videoLink || data.video || data.url || data.file || '';
                          const cleanV = normalizeImageUrl(rawV);
                          const lessonId = String(selectedSubmission.lesson_id || selectedSubmission.lessonId || '').toLowerCase();
                          const title = String(selectedSubmission.activity_title || selectedSubmission.activityTitle || '').toLowerCase();
                          const subType = String(selectedSubmission.submission_type || selectedSubmission.submissionType || '').toLowerCase();

                          const isVideoActivity = (
                            lessonId.includes('mantra-intro-video') ||
                            lessonId.includes('intro-video') ||
                            lessonId.includes('market-yourself') ||
                            lessonId.includes('grow-your-practice') ||
                            title.includes('mantra intro video') ||
                            title.includes('intro video') ||
                            subType.includes('video')
                          );

                          if (!isVideoActivity && !cleanV) return null;

                          return (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Video Status:</span>
                              {cleanV ? (
                                <span style={{ padding: '2px 8px', borderRadius: '6px', border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#16a34a', fontWeight: 800, fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <Video size={11} color="#16a34a" /> Uploaded
                                </span>
                              ) : (
                                <span style={{ padding: '2px 8px', borderRadius: '6px', border: '1px solid #fde68a', background: '#fffbe6', color: '#b45309', fontWeight: 800, fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <VideoOff size={11} color="#b45309" /> Skipped
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                    </div>
                  </>
                );
              })()}

              {/* Card 3: Form Response Data */}
              {(() => {
                const formDataEntries = Object.entries(selectedSubmission.form_data || selectedSubmission.submission_data || {})
                  .filter(([k]) => !REDUNDANT_KEYS.includes(k) && !PROOF_KEYS.includes(k));

                if (formDataEntries.length === 0) return null;

                return (
                  <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '14px 16px' }}>
                    <h4 style={{ margin: '0 0 10px', fontSize: '0.76rem', color: '#0f172a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Form Fields & Responses
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {formDataEntries.map(([key, val]) => (
                        <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #f1f5f9', fontSize: '0.78rem' }}>
                          <span style={{ fontWeight: 700, color: '#475569' }}>
                            {formatHeaderLabel(key)}:
                          </span>
                          <span style={{ color: '#0f172a', fontWeight: 600, textAlign: 'right', wordBreak: 'break-word', marginLeft: '12px' }}>
                            {String(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Card 4: Proof Screenshot Attachment */}
              {(() => {
                const proofImgUrl = extractProofImage(selectedSubmission);
                if (!proofImgUrl) return null;

                return (
                  <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '14px 16px' }}>
                    <h4 style={{ margin: '0 0 10px', fontSize: '0.76rem', color: '#0f172a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Uploaded Proof Screenshot
                    </h4>
                    <div style={{ background: '#faf5ff', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e9d5ff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={proofImgUrl}
                          alt="Proof"
                          onClick={() => setPreviewImage(proofImgUrl)}
                          style={{ width: '60px', height: '44px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', background: '#ffffff' }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div>
                          <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#7e22ce' }}>Image Proof Uploaded</div>
                          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '1px' }}>Click thumbnail to open zoom viewer</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewImage(proofImgUrl)}
                        style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #e9d5ff', background: '#ffffff', color: '#7e22ce', fontWeight: 700, fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                      >
                        <Image size={12} /> View Image <ExternalLink size={11} />
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Card 5: Uploaded Video / Video Skipped Status (Only visible for video activities or if video is present) */}
              {(() => {
                const fd = selectedSubmission.form_data || selectedSubmission.submission_data || {};
                const rawVUrl = selectedSubmission.videoUrl || selectedSubmission.video_url || selectedSubmission.video || fd.videoUrl || fd.video_url || fd.videoLink || fd.video || fd.url || fd.file || '';
                const cleanVUrl = normalizeImageUrl(rawVUrl);

                const lessonId = String(selectedSubmission.lesson_id || selectedSubmission.lessonId || '').toLowerCase();
                const title = String(selectedSubmission.activity_title || selectedSubmission.activityTitle || '').toLowerCase();
                const subType = String(selectedSubmission.submission_type || selectedSubmission.submissionType || '').toLowerCase();

                const isVideoActivity = (
                  lessonId.includes('mantra-intro-video') ||
                  lessonId.includes('intro-video') ||
                  lessonId.includes('market-yourself') ||
                  lessonId.includes('grow-your-practice') ||
                  title.includes('mantra intro video') ||
                  title.includes('intro video') ||
                  subType.includes('video')
                );

                if (!isVideoActivity && !cleanVUrl) return null;

                return (
                  <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.76rem', color: '#0f172a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Introduction Video
                      </h4>
                      {cleanVUrl ? (
                        <span style={{ padding: '2px 8px', borderRadius: '6px', border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#15803d', fontWeight: 800, fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Video size={12} color="#15803d" /> Video Uploaded
                        </span>
                      ) : (
                        <span style={{ padding: '2px 10px', borderRadius: '6px', border: '1px solid #fde68a', background: '#fef3c7', color: '#b45309', fontWeight: 800, fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <VideoOff size={12} color="#b45309" /> Video Skipped
                        </span>
                      )}
                    </div>

                    {cleanVUrl ? (
                      <>
                        <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#000000' }}>
                          <video
                            src={cleanVUrl}
                            controls
                            preload="metadata"
                            style={{ width: '100%', maxHeight: '260px', display: 'block' }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', background: '#eff6ff', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Eye size={14} />
                            </div>
                            <div>
                              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#1d4ed8' }}>Provider Introduction Video</div>
                            </div>
                          </div>
                          <a
                            href={cleanVUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #bfdbfe', background: '#ffffff', color: '#2563eb', fontWeight: 700, fontSize: '0.74rem', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', cursor: 'pointer' }}
                          >
                            <ExternalLink size={11} /> Open in New Tab
                          </a>
                        </div>
                      </>
                    ) : (
                      <div style={{ background: 'linear-gradient(135deg, #fffbe6 0%, #fef3c7 100%)', padding: '20px 16px', borderRadius: '10px', border: '1.5px dashed #f59e0b', textAlign: 'center' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', border: '1px solid #fde68a' }}>
                          <VideoOff size={22} />
                        </div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#92400e' }}>Video Step Skipped</div>
                        <div style={{ fontSize: '0.74rem', color: '#b45309', marginTop: '4px', fontWeight: 600 }}>
                          Provider opted to skip uploading an introduction video for this submission.
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 20px', background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
              <button
                onClick={() => setSelectedSubmission(null)}
                style={{ padding: '6px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', color: '#ffffff', fontWeight: 800, cursor: 'pointer', fontSize: '0.78rem', boxShadow: '0 2px 8px rgba(37,99,235,0.2)' }}
              >
                Close Record
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* MODAL 3: Manage Reviewers Modal */}
      <ManageReviewersModal
        isOpen={isManagingReviewers}
        onClose={() => setIsManagingReviewers(false)}
        onReviewersChange={(newReviewers) => setReviewerOptions(newReviewers)}
      />

      {/* Custom Date Range Modal for Table Filter */}
      {isCustomDateModalOpen && ReactDOM.createPortal(
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '380px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            border: '1px solid #e2e8f0'
          }} className="animate-scale-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Custom Date Range</h3>
              </div>
              <button
                onClick={() => setIsCustomDateModalOpen(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} color="#64748b" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={tableCustomStartDate}
                  onChange={(e) => setTableCustomStartDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                  End Date
                </label>
                <input
                  type="date"
                  value={tableCustomEndDate}
                  onChange={(e) => setTableCustomEndDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsCustomDateModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTimePeriod('custom');
                    setIsCustomDateModalOpen(false);
                    showToast('Custom date filter applied', 'success');
                  }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#2563eb',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
