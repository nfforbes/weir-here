'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
} from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewDayIcon from '@mui/icons-material/ViewDay';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MapIcon from '@mui/icons-material/Map';
import {
  format,
  addDays,
  subDays,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
} from 'date-fns';
import { ELECTRIC_BLUE, DEEP_NAVY } from '@/theme/theme';

type ViewMode = 'list' | 'day' | 'month';

interface AssignmentData {
  _id: string;
  clientId: { _id: string; name: string; address?: string };
  description: string;
  serviceDate: string;
  clientChargeCents: number;
  providerHourlyRateCents: number;
  providerPayCents: number;
  invoiced: boolean;
  status?: 'assigned' | 'arrived' | 'completed';
  arrivedAt?: string;
  checkedOutAt?: string;
}

export default function AssignmentsView() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Date state for day/month views
  const [currentDate, setCurrentDate] = useState(new Date());

  // Dialog state
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentData | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/provider/assignments');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to fetch assignments (${res.status})`);
      }
      const data = await res.json();
      setAssignments(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleViewChange = (event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handlePrevDay = () => setCurrentDate((prev) => subDays(prev, 1));
  const handleNextDay = () => setCurrentDate((prev) => addDays(prev, 1));
  const handlePrevMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));

  const openInGoogleMaps = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleAction = async (assignmentId: string, action: 'arrive' | 'checkout') => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/provider/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update assignment (${res.status})`);
      }
      const updated = await res.json();
      setAssignments((prev) =>
        prev.map((a) => (a._id === updated._id ? { ...a, ...updated } : a))
      );
      setSelectedAssignment((prev) => (prev?._id === updated._id ? { ...prev, ...updated } : prev));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ p: 4 }}><Typography color="error">{error}</Typography></Box>;

  // Filtering for views
  const dayAssignments = assignments.filter((a) => isSameDay(new Date(a.serviceDate), currentDate));
  const monthAssignments = assignments.filter((a) => isSameMonth(new Date(a.serviceDate), currentDate));

  // Month grid calculations
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const renderAssignmentCard = (a: AssignmentData) => (
    <Card 
      key={a._id} 
      sx={{ mb: 2, borderLeft: `4px solid ${ELECTRIC_BLUE}`, borderRadius: 2, cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }}
      onClick={() => setSelectedAssignment(a)}
    >
      <CardContent>
        <Typography variant="h6" fontWeight="bold">{a.clientId?.name || 'Unknown Client'}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {format(new Date(a.serviceDate), 'PPpp')}
        </Typography>
        <Box sx={{ mb: 1 }}>
          <Chip 
            size="small" 
            label={(a.status || 'assigned').toUpperCase()} 
            color={
              a.status === 'completed' ? 'success' : 
              a.status === 'arrived' ? 'warning' : 'default'
            } 
          />
        </Box>
        {a.description && <Typography variant="body1">{a.description}</Typography>}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">My Assignments</Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewChange}
          aria-label="view mode"
          size="small"
        >
          <ToggleButton value="list" aria-label="list view">
            <ViewListIcon />
          </ToggleButton>
          <ToggleButton value="day" aria-label="day view">
            <ViewDayIcon />
          </ToggleButton>
          <ToggleButton value="month" aria-label="month view">
            <CalendarMonthIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {viewMode === 'list' && (
        <Box>
          {assignments.length === 0 ? (
            <Typography>No assignments found.</Typography>
          ) : (
            assignments.map(renderAssignmentCard)
          )}
        </Box>
      )}

      {viewMode === 'day' && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <IconButton onClick={handlePrevDay}><ChevronLeftIcon /></IconButton>
            <Typography variant="h6" sx={{ mx: 2, minWidth: 200, textAlign: 'center' }}>
              {format(currentDate, 'EEEE, MMMM d, yyyy')}
            </Typography>
            <IconButton onClick={handleNextDay}><ChevronRightIcon /></IconButton>
          </Box>
          {dayAssignments.length === 0 ? (
            <Typography align="center">No assignments on this day.</Typography>
          ) : (
            dayAssignments.map(renderAssignmentCard)
          )}
        </Box>
      )}

      {viewMode === 'month' && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <IconButton onClick={handlePrevMonth}><ChevronLeftIcon /></IconButton>
            <Typography variant="h6" sx={{ mx: 2, minWidth: 200, textAlign: 'center' }}>
              {format(currentDate, 'MMMM yyyy')}
            </Typography>
            <IconButton onClick={handleNextMonth}><ChevronRightIcon /></IconButton>
          </Box>

          <Grid container spacing={1}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Grid item xs={12 / 7} key={day} sx={{ textAlign: 'center', fontWeight: 'bold', mb: 1 }}>
                {day}
              </Grid>
            ))}
            {calendarDays.map((day, idx) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const dayAssigned = monthAssignments.filter(a => isSameDay(new Date(a.serviceDate), day));

              return (
                <Grid item xs={12 / 7} key={idx}>
                  <Box
                    sx={{
                      minHeight: 80,
                      p: 1,
                      border: '1px solid #e0e0e0',
                      bgcolor: isCurrentMonth ? 'white' : '#f5f5f5',
                      opacity: isCurrentMonth ? 1 : 0.5,
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#e3f2fd' }
                    }}
                    onClick={() => {
                      setCurrentDate(day);
                      setViewMode('day');
                    }}
                  >
                    <Typography variant="caption" fontWeight="bold">
                      {format(day, 'd')}
                    </Typography>
                    {dayAssigned.length > 0 && (
                      <Box sx={{ mt: 0.5, bgcolor: ELECTRIC_BLUE, color: 'white', borderRadius: 1, px: 0.5, fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {dayAssigned.length} assignment{dayAssigned.length > 1 ? 's' : ''}
                      </Box>
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Assignment Details Dialog */}
      <Dialog open={!!selectedAssignment} onClose={() => setSelectedAssignment(null)} maxWidth="sm" fullWidth>
        {selectedAssignment && (
          <>
            <DialogTitle sx={{ bgcolor: DEEP_NAVY, color: 'white' }}>
              Assignment Details
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Typography variant="h6" fontWeight="bold">{selectedAssignment.clientId?.name || 'Unknown Client'}</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Address:</strong> {selectedAssignment.clientId?.address || 'No address provided'}
              </Typography>
              {selectedAssignment.clientId?.address?.trim() && (
                <Button
                  variant="outlined"
                  startIcon={<MapIcon />}
                  onClick={() => openInGoogleMaps(selectedAssignment.clientId!.address!)}
                  sx={{ mb: 2 }}
                >
                  Open in Google Maps
                </Button>
              )}
              
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Date & Time:</strong> {format(new Date(selectedAssignment.serviceDate), 'PPpp')}
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Description:</strong> {selectedAssignment.description || 'No description'}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" component="span"><strong>Status:</strong> </Typography>
                <Chip 
                  size="small" 
                  label={(selectedAssignment.status || 'assigned').toUpperCase()} 
                  color={
                    selectedAssignment.status === 'completed' ? 'success' : 
                    selectedAssignment.status === 'arrived' ? 'warning' : 'default'
                  } 
                />
              </Box>

              {selectedAssignment.arrivedAt && (
                <Typography variant="body2" color="text.secondary">
                  Arrived At: {format(new Date(selectedAssignment.arrivedAt), 'PPpp')}
                </Typography>
              )}
              {selectedAssignment.checkedOutAt && (
                <Typography variant="body2" color="text.secondary">
                  Checked Out At: {format(new Date(selectedAssignment.checkedOutAt), 'PPpp')}
                </Typography>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={() => setSelectedAssignment(null)}>Close</Button>
              <Box>
                {(!selectedAssignment.status || selectedAssignment.status === 'assigned') && (
                  <Button 
                    variant="contained" 
                    color="warning" 
                    onClick={() => handleAction(selectedAssignment._id, 'arrive')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <CircularProgress size={24} /> : 'Mark as Arrived'}
                  </Button>
                )}
                {selectedAssignment.status === 'arrived' && (
                  <Button 
                    variant="contained" 
                    color="success" 
                    onClick={() => handleAction(selectedAssignment._id, 'checkout')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <CircularProgress size={24} /> : 'Check Out'}
                  </Button>
                )}
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
