import axios from "axios";

export default {
	actions: {
		async getProject({ getters }, { projectId }) {
			const response = await axios.get(
				`${getters.taigaURL}/projects/${projectId}`,
				getters.authHeaders
			);
			return response.data;
		},

		async getProjects({ getters }) {
			const response = await axios.get(
				`${getters.taigaURL}/projects?member=${getters.userId}`, 
				getters.authHeaders
			);
			return response.data;
		},

		async updateProject({ getters }, { projectId, project }) {
			const response = await axios.patch(
				`${getters.taigaURL}/projects/${projectId}`,
				project,
				getters.authHeaders
			);
			return response.data;
		},

		async getUser({ getters }, { userId }) {
			const response = await axios.get(
				`${getters.taigaURL}/users/${userId}`, 
				getters.authHeaders
			);
			return response.data;
		},

		async getUserStory({ getters }, { projectId, userStoryRef }) {
			const response = await axios.get(
				`${getters.taigaURL}/userstories/by_ref?ref=${userStoryRef}&project=${projectId}`, 
				getters.authHeaders
			);
			return response.data;
		},

		async getUserStoriesByEpic({ getters }, { epicId }) {
			const response = await axios.get(
				`${getters.taigaURL}/userstories?epic=${epicId}&include_tasks=true&order_by=epic_order`,
				getters.authHeaders
			);
			return response.data;
		},

		async getUserStoryAttachments({ getters }, { userStoryId, projectId }) {
			const response = await axios.get(
				`${getters.taigaURL}/userstories/attachments?object_id=${userStoryId}&project=${projectId}`,
				getters.authHeaders
			);
			return response.data;
		},

		async fetchAttachment(_, { url }) {
			if (!window?.taigaExport?.fetchAttachment) {
				throw new Error('Attachment fetcher is unavailable.');
			}
			return window.taigaExport.fetchAttachment(url);
		},

		async uploadAttachment({ getters }, { formData }) {
			const response = await axios.post(`${getters.taigaURL}/userstories/attachments`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'Authorization': `Bearer ${getters.token}`
				}
			});
			return response.data;
		},

		async getUserStoryComments({ getters }, { userStoryId }) {
			const response = await axios.get(
				`${getters.taigaURL}/history/userstory/${userStoryId}?type=comment`,
				getters.authHeaders
			);
			return response.data;
		},

		async createStatus({ getters }, { status }) {
			const response = await axios.post(
				`${getters.taigaURL}/userstory-statuses`,
				status,
				getters.authHeaders
			);
			return response.data;
		},

		async getEpic({ getters }, { epicRef, projectId }) {
			const response = await axios.get(
				`${getters.taigaURL}/epics/by_ref?project=${projectId}&ref=${epicRef}`,
				getters.authHeaders
			);
			return response.data;
		},

		async getEpics({ getters }, { projectId }) {
			const response = await axios.get(
				`${getters.taigaURL}/epics?project=${projectId}`,
				getters.authHeaders
			);
			return response.data;
		},

		async createEpic({ getters }, { epic }) {
			const response = await axios.post(
				`${getters.taigaURL}/epics`,
				epic,
				getters.authHeaders
			);
			return response.data;
		},

		async relateEpicToUserStory({ getters }, { epicId, userStoryId }) {
			const response = await axios.post(
				`${getters.taigaURL}/epics/${epicId}/related_userstories`,
				{ epic: epicId, user_story: userStoryId },
				getters.authHeaders
			);
			return response.data;
		},

		async getTasks({ getters }, { userStoryId, projectId }) {
			const response = await axios.get(
				`${getters.taigaURL}/tasks?order_by=us_order&project=${projectId}&user_story=${userStoryId}`,
				getters.authHeaders
			);
			return response.data;
		},

		async getTask({ getters }, { userStoryId, projectId, taskRef }) {
			const response = await axios.get(
				`${getters.taigaURL}/tasks/by_ref?order_by=us_order&project=${projectId}&ref=${taskRef}&user_story=${userStoryId}`,
				getters.authHeaders
			);
			return response.data;
		},

		async getTaskAttachments({ getters }, { taskId, projectId }) {
			const response = await axios.get(
				`${getters.taigaURL}/tasks/attachments?object_id=${taskId}&project=${projectId}`,
				getters.authHeaders
			);
			return response.data;
		},

		async uploadTaskAttachment({ getters }, { formData }) {
			const response = await axios.post(`${getters.taigaURL}/tasks/attachments`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'Authorization': `Bearer ${getters.token}`
				}
			});
			return response.data;
		},

		async getTaskComments({ getters }, { taskId }) {
			const response = await axios.get(
				`${getters.taigaURL}/history/task/${taskId}?type=comment`,
				getters.authHeaders
			);
			return response.data;
		},

		async createTask({ getters }, { data }) {
			const response = await axios.post(
				`${getters.taigaURL}/tasks`,
				data,
				getters.authHeaders
			);
			return response.data;
		},

		async updateTask({ getters }, { id, task }) {
			const response = await axios.patch(
				`${getters.taigaURL}/tasks/${id}`,
				task,
				getters.authHeaders
			);
			return response.data;
		},

		async createUserStory({ getters }, { data }) {
			const response = await axios.post(
				`${getters.taigaURL}/userstories`,
				data,
				getters.authHeaders
			);
			return response.data;
		},

		async updateUserStory({ getters }, { id, userStory }) {
			const response = await axios.patch(
				`${getters.taigaURL}/userstories/${id}`,
				userStory,
				getters.authHeaders
			);
			return response.data;
		},

		async deleteUserStory({ getters }, { id }) {
			const response = await axios.delete(
				`${getters.taigaURL}/userstories/${id}`,
				getters.authHeaders
			);
			return response.data;
		}
	}
}
