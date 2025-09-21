import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { useAlerts } from '@/Contexts/AlertContext';

const dayOptions = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
];

function EditSection() {
  const { props } = usePage();
  const { section, statusOptions = [], termOptions = [], courseOptions = [], roomOptions = [], facultyOptions = [] } = props;
  const { success, error } = useAlerts();

  const [activeTab, setActiveTab] = useState('overview');
  const [meetingEdit, setMeetingEdit] = useState(null);
  const [appointmentEdit, setAppointmentEdit] = useState(null);
  const [meetingConflicts, setMeetingConflicts] = useState(null);
  const [appointmentConflicts, setAppointmentConflicts] = useState(null);
  const [conflictMatrix, setConflictMatrix] = useState(null);

  const overviewForm = useForm({
    course_id: section?.course_id ?? '',
    term_id: section?.term_id ?? '',
    section_code: section?.section_code ?? '',
    capacity: section?.capacity ?? 0,
    waitlist_cap: section?.waitlist_cap ?? 0,
    status: section?.status ?? statusOptions?.[0] ?? 'planned',
    notes: section?.notes ?? '',
  });

  const meetingForm = useForm({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '10:00',
    modality: 'onsite',
    room_id: '',
    repeat_until: '',
    repeat_exdates: '',
  });

  const appointmentForm = useForm({
    user_id: '',
    role: 'lecturer',
    load_percent: 50,
    assigned_at: '',
  });

  useEffect(() => {
    if (meetingForm.errors.conflict_matrix) {
      try {
        setMeetingConflicts(JSON.parse(meetingForm.errors.conflict_matrix));
      } catch (e) {
        setMeetingConflicts(null);
      }
    } else {
      setMeetingConflicts(null);
    }
  }, [meetingForm.errors.conflict_matrix]);

  useEffect(() => {
    if (appointmentForm.errors.conflict_matrix) {
      try {
        setAppointmentConflicts(JSON.parse(appointmentForm.errors.conflict_matrix));
      } catch (e) {
        setAppointmentConflicts(null);
      }
    } else {
      setAppointmentConflicts(null);
    }
  }, [appointmentForm.errors.conflict_matrix]);

  const submitOverview = (e) => {
    e.preventDefault();
    overviewForm.put(route('admin.sections.update', section.id), {
      preserveScroll: true,
      onSuccess: () => {
        success('Section updated successfully');
      },
      onError: (errors) => {
        error(Object.values(errors).flat().join('\n') || 'Failed to update section');
      },
    });
  };

  const buildRepeatRule = (data) => {
    const exdates = data.repeat_exdates
      ? data.repeat_exdates.split(',').map((v) => v.trim()).filter(Boolean)
      : [];

    if (!data.repeat_until && exdates.length === 0) {
      return null;
    }

    const rule = { freq: 'WEEKLY' };
    if (data.repeat_until) {
      rule.until = data.repeat_until;
    }
    if (exdates.length) {
      rule.exdates = exdates;
    }
    return rule;
  };

  const resetMeetingForm = () => {
    meetingForm.reset();
    meetingForm.setData({
      day_of_week: 1,
      start_time: '09:00',
      end_time: '10:00',
      modality: 'onsite',
      room_id: '',
      repeat_until: '',
      repeat_exdates: '',
    });
    setMeetingConflicts(null);
    setMeetingEdit(null);
  };

  const submitMeeting = (e) => {
    e.preventDefault();
    const payload = {
      day_of_week: meetingForm.data.day_of_week,
      start_time: meetingForm.data.start_time,
      end_time: meetingForm.data.end_time,
      modality: meetingForm.data.modality,
      room_id: meetingForm.data.modality === 'onsite' ? Number(meetingForm.data.room_id) : null,
      repeat_rule: buildRepeatRule(meetingForm.data),
    };

    const options = {
      preserveScroll: true,
      onSuccess: () => {
        success(meetingEdit ? 'Meeting updated successfully' : 'Meeting created successfully');
        resetMeetingForm();
      },
      onError: (errors) => {
        error(Object.values(errors).filter((msg) => typeof msg === 'string').join('\n') || 'Failed to save meeting');
      },
    };

    if (meetingEdit) {
      router.put(route('admin.sections.meetings.update', [section.id, meetingEdit.id]), payload, options);
    } else {
      router.post(route('admin.sections.meetings.store', section.id), payload, options);
    }
  };

  const editMeeting = (meeting) => {
    setMeetingEdit(meeting);
    meetingForm.setData({
      day_of_week: meeting.day_of_week,
      start_time: meeting.start_time,
      end_time: meeting.end_time,
      modality: meeting.modality,
      room_id: meeting.room_id ?? '',
      repeat_until: meeting.repeat_rule?.until ?? '',
      repeat_exdates: Array.isArray(meeting.repeat_rule?.exdates) ? meeting.repeat_rule.exdates.join(', ') : '',
    });
    setMeetingConflicts(null);
  };

  const deleteMeeting = (meeting) => {
    router.delete(route('admin.sections.meetings.destroy', [section.id, meeting.id]), {
      preserveScroll: true,
      onSuccess: () => success('Meeting removed successfully'),
      onError: (errors) => error(Object.values(errors).flat().join('\n') || 'Failed to remove meeting'),
    });
  };

  const resetAppointmentForm = () => {
    appointmentForm.reset();
    appointmentForm.setData({
      user_id: '',
      role: 'lecturer',
      load_percent: 50,
      assigned_at: '',
    });
    setAppointmentConflicts(null);
    setAppointmentEdit(null);
  };

  const submitAppointment = (e) => {
    e.preventDefault();
    const payload = {
      user_id: Number(appointmentForm.data.user_id),
      role: appointmentForm.data.role,
      load_percent: Number(appointmentForm.data.load_percent),
      assigned_at: appointmentForm.data.assigned_at || undefined,
    };

    const options = {
      preserveScroll: true,
      onSuccess: () => {
        success(appointmentEdit ? 'Assignment updated successfully' : 'Assignment added successfully');
        resetAppointmentForm();
      },
      onError: (errors) => {
        error(Object.values(errors).filter((msg) => typeof msg === 'string').join('\n') || 'Failed to save assignment');
      },
    };

    if (appointmentEdit) {
      router.put(route('admin.sections.appointments.update', [section.id, appointmentEdit.id]), payload, options);
    } else {
      router.post(route('admin.sections.appointments.store', section.id), payload, options);
    }
  };

  const editAppointment = (appointment) => {
    setAppointmentEdit(appointment);
    appointmentForm.setData({
      user_id: appointment.user_id,
      role: appointment.role,
      load_percent: appointment.load_percent,
      assigned_at: appointment.assigned_at ? appointment.assigned_at.substring(0, 10) : '',
    });
    setAppointmentConflicts(null);
  };

  const deleteAppointment = (appointment) => {
    router.delete(route('admin.sections.appointments.destroy', [section.id, appointment.id]), {
      preserveScroll: true,
      onSuccess: () => success('Assignment removed successfully'),
      onError: (errors) => error(Object.values(errors).flat().join('\n') || 'Failed to remove assignment'),
    });
  };

  const checkConflicts = () => {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    const headers = {
      'X-Requested-With': 'XMLHttpRequest',
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['X-CSRF-TOKEN'] = token;
    }

    window.axios.post(route('admin.api.sections.conflicts', section.id), {}, { headers, withCredentials: true })
      .then((response) => {
        const data = response.data;
        setConflictMatrix(data);
        if (data?.room?.length === 0 && data?.teacher?.length === 0) {
          success('No conflicts detected');
        }
      })
      .catch((err) => {
        console.error('Conflict check failed', err);
        error('Unable to check conflicts at this time');
      });
  };

  const exportIcs = () => {
    window.open(route('admin.api.sections.ics', section.id), '_blank');
  };

  const statusBadge = useMemo(() => ({
    planned: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300',
    active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    closed: 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-300',
    cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
  }), []);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{section.course?.code} — {section.section_code}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <span>{section.course?.title}</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[section.status] || ''}`}>{section.status}</span>
            <span>Term: {section.term?.title || section.term?.code}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SecondaryButton onClick={checkConflicts}>Check Conflicts</SecondaryButton>
          <SecondaryButton onClick={exportIcs}>Export ICS</SecondaryButton>
          <SecondaryButton asChild>
            <Link href={route('admin.sections.index')}>Back to Sections</Link>
          </SecondaryButton>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 rounded-xl bg-gray-100 p-1 dark:bg-gray-900/60">
        {['overview', 'meetings', 'team', 'activity'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-800 dark:text-gray-100' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'}`}
          >
            {tab === 'overview' && 'Overview'}
            {tab === 'meetings' && 'Meetings'}
            {tab === 'team' && 'Teaching Team'}
            {tab === 'activity' && 'Activity'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <form onSubmit={submitOverview} className="grid gap-6 md:grid-cols-2">
            <div>
              <InputLabel htmlFor="overview-course" value="Course" />
              <select
                id="overview-course"
                value={overviewForm.data.course_id}
                onChange={(e) => overviewForm.setData('course_id', e.target.value)}
                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                required
              >
                {courseOptions.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} — {course.title}
                  </option>
                ))}
              </select>
              <InputError message={overviewForm.errors.course_id} className="mt-2" />
            </div>

            <div>
              <InputLabel htmlFor="overview-term" value="Term" />
              <select
                id="overview-term"
                value={overviewForm.data.term_id}
                onChange={(e) => overviewForm.setData('term_id', e.target.value)}
                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                required
              >
                {termOptions.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.title || term.code}
                  </option>
                ))}
              </select>
              <InputError message={overviewForm.errors.term_id} className="mt-2" />
            </div>

            <div>
              <InputLabel htmlFor="overview-code" value="Section Code" />
              <TextInput
                id="overview-code"
                value={overviewForm.data.section_code}
                onChange={(e) => overviewForm.setData('section_code', e.target.value)}
                className="mt-1 block w-full"
                required
              />
              <InputError message={overviewForm.errors.section_code} className="mt-2" />
            </div>

            <div>
              <InputLabel htmlFor="overview-status" value="Status" />
              <select
                id="overview-status"
                value={overviewForm.data.status}
                onChange={(e) => overviewForm.setData('status', e.target.value)}
                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                ))}
              </select>
              <InputError message={overviewForm.errors.status} className="mt-2" />
            </div>

            <div>
              <InputLabel htmlFor="overview-capacity" value="Capacity" />
              <TextInput
                id="overview-capacity"
                type="number"
                min="0"
                value={overviewForm.data.capacity}
                onChange={(e) => overviewForm.setData('capacity', e.target.value)}
                className="mt-1 block w-full"
                required
              />
              <InputError message={overviewForm.errors.capacity} className="mt-2" />
            </div>

            <div>
              <InputLabel htmlFor="overview-waitlist" value="Waitlist Capacity" />
              <TextInput
                id="overview-waitlist"
                type="number"
                min="0"
                value={overviewForm.data.waitlist_cap}
                onChange={(e) => overviewForm.setData('waitlist_cap', e.target.value)}
                className="mt-1 block w-full"
              />
              <InputError message={overviewForm.errors.waitlist_cap} className="mt-2" />
            </div>

            <div className="md:col-span-2">
              <InputLabel htmlFor="overview-notes" value="Notes" />
              <textarea
                id="overview-notes"
                value={overviewForm.data.notes}
                onChange={(e) => overviewForm.setData('notes', e.target.value)}
                className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                rows={4}
              />
              <InputError message={overviewForm.errors.notes} className="mt-2" />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3">
              <PrimaryButton type="submit" disabled={overviewForm.processing}>Save Changes</PrimaryButton>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'meetings' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {meetingEdit ? 'Update Meeting' : 'Add Meeting'}
            </h2>
            <form onSubmit={submitMeeting} className="space-y-4">
              <div>
                <InputLabel htmlFor="meeting-day" value="Day" />
                <select
                  id="meeting-day"
                  value={meetingForm.data.day_of_week}
                  onChange={(e) => meetingForm.setData('day_of_week', Number(e.target.value))}
                  className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                  {dayOptions.map((day) => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
                <InputError message={meetingForm.errors.day_of_week} className="mt-2" />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <InputLabel htmlFor="meeting-start" value="Start" />
                  <input
                    id="meeting-start"
                    type="time"
                    value={meetingForm.data.start_time}
                    onChange={(e) => meetingForm.setData('start_time', e.target.value)}
                    className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    required
                  />
                  <InputError message={meetingForm.errors.start_time} className="mt-2" />
                </div>
                <div>
                  <InputLabel htmlFor="meeting-end" value="End" />
                  <input
                    id="meeting-end"
                    type="time"
                    value={meetingForm.data.end_time}
                    onChange={(e) => meetingForm.setData('end_time', e.target.value)}
                    className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    required
                  />
                  <InputError message={meetingForm.errors.end_time} className="mt-2" />
                </div>
              </div>

              <div>
                <InputLabel htmlFor="meeting-modality" value="Modality" />
                <select
                  id="meeting-modality"
                  value={meetingForm.data.modality}
                  onChange={(e) => meetingForm.setData('modality', e.target.value)}
                  className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="onsite">Onsite</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                <InputError message={meetingForm.errors.modality} className="mt-2" />
              </div>

              {meetingForm.data.modality === 'onsite' && (
                <div>
                  <InputLabel htmlFor="meeting-room" value="Room" />
                  <select
                    id="meeting-room"
                    value={meetingForm.data.room_id || ''}
                    onChange={(e) => meetingForm.setData('room_id', e.target.value)}
                    className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    required
                  >
                    <option value="" disabled>Select room</option>
                    {roomOptions.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.building} {room.room_no} ({room.seats} seats)
                      </option>
                    ))}
                  </select>
                  <InputError message={meetingForm.errors.room_id} className="mt-2" />
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <InputLabel htmlFor="meeting-repeat-until" value="Repeat until" />
                  <input
                    id="meeting-repeat-until"
                    type="date"
                    value={meetingForm.data.repeat_until}
                    onChange={(e) => meetingForm.setData('repeat_until', e.target.value)}
                    className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <InputLabel htmlFor="meeting-exdates" value="Skip dates (comma separated YYYY-MM-DD)" />
                  <TextInput
                    id="meeting-exdates"
                    value={meetingForm.data.repeat_exdates}
                    onChange={(e) => meetingForm.setData('repeat_exdates', e.target.value)}
                    className="mt-1 block w-full"
                  />
                </div>
              </div>

              {meetingConflicts && (
                <div className="rounded-xl border border-amber-400 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">
                  <h3 className="mb-2 font-semibold">Conflicts detected</h3>
                  {meetingConflicts.room?.overlap_with?.length > 0 && (
                    <div className="mb-2">
                      <p className="font-medium">Room conflicts:</p>
                      <ul className="list-disc pl-5">
                        {meetingConflicts.room.overlap_with.map((conflict) => (
                          <li key={`room-${conflict.meeting_id}`}>
                            {conflict.course_code} section {conflict.section_id} on day {conflict.day_of_week} {conflict.start_time} - {conflict.end_time}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(meetingConflicts.teacher) && meetingConflicts.teacher.length > 0 && (
                    <div>
                      <p className="font-medium">Teaching conflicts:</p>
                      <ul className="list-disc pl-5">
                        {meetingConflicts.teacher.map((conflict) => (
                          <li key={`teacher-${conflict.user_id}`}>
                            Staff ID {conflict.user_id} overlaps with sections {conflict.overlaps.map((overlap) => overlap.section_id).join(', ')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                {meetingEdit && (
                  <SecondaryButton type="button" onClick={resetMeetingForm}>Cancel edit</SecondaryButton>
                )}
                <div className="flex flex-1 justify-end gap-3">
                  <PrimaryButton type="submit" disabled={meetingForm.processing}>
                    {meetingEdit ? 'Update Meeting' : 'Add Meeting'}
                  </PrimaryButton>
                </div>
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Scheduled Meetings</h2>
            <div className="space-y-4">
              {section.meetings?.length ? section.meetings.map((meeting) => (
                <div key={meeting.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {dayOptions.find((day) => day.value === meeting.day_of_week)?.label || 'Day'} · {meeting.start_time}–{meeting.end_time}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {meeting.modality === 'onsite' && meeting.room ? `${meeting.room.building} ${meeting.room.room_no}` : meeting.modality.charAt(0).toUpperCase() + meeting.modality.slice(1)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <SecondaryButton onClick={() => editMeeting(meeting)}>Edit</SecondaryButton>
                      <DangerButton onClick={() => deleteMeeting(meeting)}>Delete</DangerButton>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No meetings scheduled yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {appointmentEdit ? 'Update Assignment' : 'Assign Staff'}
            </h2>
            <form onSubmit={submitAppointment} className="space-y-4">
              <div>
                <InputLabel htmlFor="team-user" value="Instructor / TA" />
                <select
                  id="team-user"
                  value={appointmentForm.data.user_id}
                  onChange={(e) => appointmentForm.setData('user_id', e.target.value)}
                  className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  required
                >
                  <option value="" disabled>Select staff member</option>
                  {facultyOptions.map((user) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
                <InputError message={appointmentForm.errors.user_id} className="mt-2" />
              </div>

              <div>
                <InputLabel htmlFor="team-role" value="Role" />
                <select
                  id="team-role"
                  value={appointmentForm.data.role}
                  onChange={(e) => appointmentForm.setData('role', e.target.value)}
                  className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="lecturer">Lecturer</option>
                  <option value="ta">Teaching Assistant</option>
                </select>
                <InputError message={appointmentForm.errors.role} className="mt-2" />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <InputLabel htmlFor="team-load" value="Load %" />
                  <TextInput
                    id="team-load"
                    type="number"
                    min="0"
                    max="100"
                    value={appointmentForm.data.load_percent}
                    onChange={(e) => appointmentForm.setData('load_percent', e.target.value)}
                    className="mt-1 block w-full"
                    required
                  />
                  <InputError message={appointmentForm.errors.load_percent} className="mt-2" />
                </div>
                <div>
                  <InputLabel htmlFor="team-assigned" value="Assigned at" />
                  <input
                    id="team-assigned"
                    type="date"
                    value={appointmentForm.data.assigned_at}
                    onChange={(e) => appointmentForm.setData('assigned_at', e.target.value)}
                    className="mt-1 block w-full rounded-xl border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              {appointmentConflicts && Array.isArray(appointmentConflicts.teacher) && appointmentConflicts.teacher.length > 0 && (
                <div className="rounded-xl border border-amber-400 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">
                  <h3 className="mb-2 font-semibold">Teaching conflicts</h3>
                  <ul className="list-disc pl-5">
                    {appointmentConflicts.teacher.map((conflict) => (
                      <li key={`teach-conf-${conflict.user_id}`}>
                        Staff ID {conflict.user_id} overlaps with sections {conflict.overlaps.map((overlap) => overlap.section_id).join(', ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                {appointmentEdit && (
                  <SecondaryButton type="button" onClick={resetAppointmentForm}>Cancel edit</SecondaryButton>
                )}
                <PrimaryButton type="submit" disabled={appointmentForm.processing}>
                  {appointmentEdit ? 'Update Assignment' : 'Assign'}
                </PrimaryButton>
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Teaching Team</h2>
            <div className="space-y-4">
              {section.appointments?.length ? section.appointments.map((appointment) => (
                <div key={appointment.id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{appointment.user?.name || `User #${appointment.user_id}`}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{appointment.role === 'lecturer' ? 'Lecturer' : 'Teaching Assistant'} · {appointment.load_percent}% load</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <SecondaryButton onClick={() => editAppointment(appointment)}>Edit</SecondaryButton>
                      <DangerButton onClick={() => deleteAppointment(appointment)}>Remove</DangerButton>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No teaching assignments yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
          Activity feed integration coming soon.
        </div>
      )}

      {conflictMatrix && (
        <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm dark:border-indigo-500/40 dark:bg-indigo-500/10">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-indigo-700 dark:text-indigo-200">Latest conflict check</h3>
            <button className="text-xs text-indigo-600 underline dark:text-indigo-300" onClick={() => setConflictMatrix(null)}>Dismiss</button>
          </div>
          {conflictMatrix.room?.length ? (
            <div className="mb-3 text-sm text-indigo-800 dark:text-indigo-200">
              <p className="font-medium">Room conflicts:</p>
              <ul className="list-disc pl-5">
                {conflictMatrix.room.map((row) => (
                  <li key={`matrix-room-${row.meeting_id}`}>
                    Meeting #{row.meeting_id} overlaps with meetings {row.overlap_with.map((overlap) => overlap.meeting_id).join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-indigo-800 dark:text-indigo-200">No room conflicts detected.</p>
          )}

          {conflictMatrix.teacher?.length ? (
            <div className="text-sm text-indigo-800 dark:text-indigo-200">
              <p className="font-medium">Teaching conflicts:</p>
              <ul className="list-disc pl-5">
                {conflictMatrix.teacher.map((row) => (
                  <li key={`matrix-teacher-${row.user_id}`}>
                    User #{row.user_id} overlaps with meetings {row.overlaps.map((overlap) => `${overlap.section_id}/${overlap.meeting_id}`).join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-2 text-sm text-indigo-800 dark:text-indigo-200">No instructor conflicts detected.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function Edit() {
  return (
    <AdminLayout title="Edit Section" header="Edit Section">
      <Head title="Edit Section" />
      <EditSection />
    </AdminLayout>
  );
}
