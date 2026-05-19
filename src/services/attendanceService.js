import { apiClient } from './apiClient.js';

const BASE_ENDPOINT = '/attendances';

export const attendanceService = {
  async getAll(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.user_id) queryParams.append('user_id', params.user_id);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.attendance_type) queryParams.append('attendance_type', params.attendance_type);

    const endpoint = BASE_ENDPOINT + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  async getToday() {
    return apiClient.get(BASE_ENDPOINT + '/today');
  },

  async getCollaboratorsToday() {
    return apiClient.get(BASE_ENDPOINT + '/collaborators-today');
  },

  async checkIn(data) {
    return apiClient.post(BASE_ENDPOINT + '/check-in', data);
  },

  async mark(data) {
    return apiClient.post(BASE_ENDPOINT + '/mark', data);
  },

  async markAllPresent() {
    return apiClient.post(BASE_ENDPOINT + '/mark-all-present');
  },

  async getByUser(userId, month, year) {
    const queryParams = new URLSearchParams();
    if (month) queryParams.append('month', month);
    if (year) queryParams.append('year', year);

    const endpoint = BASE_ENDPOINT + '/user/' + userId + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  async getSummary(month, year) {
    const queryParams = new URLSearchParams();
    if (month) queryParams.append('month', month);
    if (year) queryParams.append('year', year);

    const endpoint = BASE_ENDPOINT + '/summary' + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  async getHistorySummary(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.collaborator_id) queryParams.append('collaborator_id', params.collaborator_id);
    if (params.status) queryParams.append('status', params.status);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);

    const endpoint = BASE_ENDPOINT + '/history-summary' + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  async getYearsTree(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.collaborator_id) queryParams.append('collaborator_id', params.collaborator_id);
    if (params.status) queryParams.append('status', params.status);

    const endpoint = BASE_ENDPOINT + '/years-tree' + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  async getMonthsByYear(year, params = {}) {
    const queryParams = new URLSearchParams();
    if (params.collaborator_id) queryParams.append('collaborator_id', params.collaborator_id);
    if (params.status) queryParams.append('status', params.status);

    const endpoint = BASE_ENDPOINT + `/years/${year}/months` + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  async getDaysByYearMonth(year, month, params = {}) {
    const queryParams = new URLSearchParams();
    if (params.collaborator_id) queryParams.append('collaborator_id', params.collaborator_id);
    if (params.status) queryParams.append('status', params.status);

    const endpoint = BASE_ENDPOINT + `/years/${year}/months/${month}/days` + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  async getByYearMonth(year, month) {
    return apiClient.get(BASE_ENDPOINT + `/by-year-month?year=${year}&month=${month}`);
  },

  async getByDate(date, params = {}) {
    const queryParams = new URLSearchParams();
    if (params.collaborator_id) queryParams.append('collaborator_id', params.collaborator_id);
    if (params.status) queryParams.append('status', params.status);

    const endpoint = BASE_ENDPOINT + `/by-date/${date}` + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  },

  async closeDay(date) {
    return apiClient.post(BASE_ENDPOINT + '/close-day', { date });
  },

  async reopenDay(date) {
    return apiClient.post(BASE_ENDPOINT + '/reopen-day', { date });
  },

  async getDayStatus(date) {
    const queryParams = new URLSearchParams();
    if (date) queryParams.append('date', date);

    const endpoint = BASE_ENDPOINT + '/day-status' + (queryParams.toString() ? '?' + queryParams.toString() : '');
    return apiClient.get(endpoint);
  }
};
