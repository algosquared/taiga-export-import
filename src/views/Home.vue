<template>
	<div class="home">
		<aside>
			<Header @logout="logout" />

			<template v-if="!projects.length"> Loading... </template>

			<div class="select-container" v-if="projects.length">
				<p class="title">From</p>
				<select id="originProject" :disabled="isProjectsSelected">
					<option
						v-for="project in projects"
						:key="project.id"
						:value="project.id"
					>
						{{ project.name }}
					</option>
				</select>

				<p class="title">To</p>
				<select id="destinationProject" :disabled="isProjectsSelected">
					<option
						v-for="project in projects"
						:key="project.id"
						:value="project.id"
					>
						{{ project.name }}
					</option>
				</select>

				<div class="buttons">
					<button
						v-if="!isProjectsSelected"
						class="confirm"
						type="button"
						@click="setProjects"
					>
						Select
					</button>
					<button v-else class="reset" type="button" @click="resetProjects">
						Reset
					</button>
				</div>
			</div>

			<button class="logout" type="button" @click="logout">Logout</button>
		</aside>
		<main>
			<div class="search-container" v-if="isProjectsSelected">
				<div class="input-container">
					<input
						type="text"
						@keyup="handleSearchKeyup"
						autofocus
						ref="inputSearch"
						@focus="searchInputFocused = true"
						@blur="searchInputFocused = false"
						:placeholder="
							searchFor === 'userStory'
								? 'KANBAN USER STORY REF #'
								: 'EPIC REF #'
						"
						:disabled="isExporting"
					/>
					<span
						class="progress-bar"
						:style="{
							opacity: isExporting || searchInputFocused ? 1 : 0,
							width: isExporting
								? `${(exportProgress.current / exportProgress.total) * 100}%`
								: '100%',
						}"
					></span>
					<button
						type="button"
						class="switch"
						@click="showSearchOptions = true"
						v-if="!showSearchOptions"
					>
						<!-- <img :src="require('@/assets/more.svg')" alt="Switch"> -->
						Switch
					</button>
				</div>

				<div class="search-options" v-if="showSearchOptions">
					<label>
						<input
							type="radio"
							v-model="searchFor"
							name="searchFor"
							value="userStory"
						/>
						Search for user story
					</label>
					<label>
						<input
							type="radio"
							value="epic"
							name="searchFor"
							v-model="searchFor"
						/>
						Search for Epic
					</label>

					<button class="hide" type="button" @click="showSearchOptions = false">
						Hide bar
					</button>
				</div>
			</div>

			<section class="left-side">
				<div class="result-container" v-if="searchResult">
					<p>
						{{ displaySearchResult }}
					</p>
					<a
						v-if="isSearchResultValid"
						:href="
							searchFor === 'userStory'
								? `https://tree.taiga.io/project/${originProject.slug}/us/${searchResult.ref}`
								: `https://tree.taiga.io/project/${originProject.slug}/epic/${searchResult.ref}`
						"
						class="open"
					>View</a>
					<button
						class="export"
						type="button"
						v-if="isSearchResultValid && !isExporting"
						@click="executeExport"
					>
						Export {{ searchInputFocused ? "(Press Enter)" : "" }}
					</button>
					<button
						class="export exporting"
						type="button"
						v-if="isExporting"
						disabled
					>
						Exporting...
					</button>
				</div>

				<div class="history-container" v-if="history.length">
					<p>History</p>
					<ul class="history-list">
						<li v-for="story in history" :key="story.id">
							<p>
								<span>#{{ story.ref }} </span>
								<span>{{ story.subject }}</span>
							</p>

							<div class="actions-menu">
								<a
									class="view" 
									type="button"
									:href="`https://tree.taiga.io/project/${destinationProject.slug}/us/${story.ref}`"
								>View</a>
								<button
									class="delete"
									type="button"
									@click="deleteStory(story.id)"
								>Delete</button>
							</div>
						</li>
					</ul>
				</div>
			</section>

			<div class="export-options" v-if="isSearchResultValid">
				<p>Options</p>
				<label>
					<input type="checkbox" v-model="options.assigned_users" />
					Assigned users
				</label>
				<label>
					<input type="checkbox" v-model="options.watchers" />
					Watchers
				</label>
				<label>
					<input type="checkbox" v-model="options.description" />
					Description
				</label>
				<label>
					<input type="checkbox" v-model="options.status" />
					Status
				</label>
				<label>
					<input type="checkbox" v-model="options.tags" />
					Tags
				</label>
				<label>
					<input type="checkbox" v-model="options.comments" />
					Comments
				</label>
				<label>
					<input type="checkbox" v-model="options.attachments" />
					Attachments
				</label>
				<label>
					<input type="checkbox" v-model="options.points" />
					Points
				</label>
				<label>
					<input type="checkbox" v-model="options.epics" />
					Epics
				</label>
				<label>
					<input type="checkbox" v-model="options.tasks" />
					Tasks
				</label>
			</div>
		</main>
	</div>
</template>

<script>
import Header from "@/components/Header.vue";

function getDefaultConfig() {
	return {
		originProject: null,
		destinationProject: null,
	};
}
function getOptions() {
	return {
		assigned_to: false, // single user - for tasks
		assigned_users: true, // multiple users - for user stories
		watchers: true,
		description: true,
		status: true,
		tags: true,
		comments: true,
		attachments: true,
		points: true,
		epics: true,
		tasks: true,
	};
}

export default {
	name: "Home",
	components: {
		Header,
	},
	data: () => {
		return {
			projects: [],
			config: getDefaultConfig(),
			options: getOptions(),

			showSearchOptions: true,
			searchFor: "userStory",
			searchTimeout: null,
			searchResult: null,
			searchInputFocused: false,
			isExporting: false,
			exportProgress: {
				total: 0,
				current: 0,
			}, // progess bar
			history: [],
		};
	},
	computed: {
		isProjectsSelected() {
			return this.config.originProject && this.config.destinationProject;
		},
		originProject() {
			return this.projects.find(
				(project) => project.id == this.config.originProject
			);
		},
		destinationProject() {
			return this.projects.find(
				(project) => project.id == this.config.destinationProject
			);
		},
		displaySearchResult() {
			if (this.searchResult === null) return "";
			if (typeof this.searchResult === "string") return this.searchResult;
			return `#${this.searchResult.ref} ${this.searchResult.subject}`;
		},
		isSearchResultValid() {
			return this.searchResult && typeof this.searchResult === "object";
		},
	},
	methods: {
		async fetchProjects() {
			try {
				const projects = await this.$store.dispatch("getProjects");
				const filteredProjects = projects.filter(
					(project) => project.i_am_owner
				);
				if (filteredProjects.length < 2)
					throw new Error("You need at least 2 projects to use this app.");
				this.projects = filteredProjects;
			} catch (e) {
				this.projects = [];
				this.showError(e);
				setTimeout(() => {
					this.logout();
				}, 3000);
			}
		},

		setOriginProject() {
			const originProject = document.querySelector("#originProject").value;
			this.config.originProject = originProject; // id
		},

		setDestinationProject() {
			const destinationProject = document.querySelector(
				"#destinationProject"
			).value;
			this.config.destinationProject = destinationProject; // id
		},

		setProjects() {
			try {
				this.setOriginProject();
				this.setDestinationProject();
				if (this.config.destinationProject === this.config.originProject)
					throw new Error(
						"Origin and destination projects cannot be the same."
					);

				this.$nextTick(() => {
					if (this.$refs["inputSearch"]) this.$refs["inputSearch"].focus();
				});
			} catch (e) {
				this.showError(e);
				this.config = getDefaultConfig();
			}
		},

		resetHistory() {
			this.history = [];
		},

		resetSearch() {
			if (this.searchTimeout) clearTimeout(this.searchTimeout);
			this.searchTimeout = null;
			this.searchResult = null;
			this.$refs["inputSearch"].value = "";
		},

		resetProjects() {
			this.resetSearch();
			this.config = getDefaultConfig();
			this.resetHistory();
		},

		handleSearchKeyup(e) {
			if (e.key === "Enter") {
				if (this.isSearchResultValid) this.executeExport();
				return;
			}
			if (this.searchTimeout) clearTimeout(this.searchTimeout);

			let reference = this.$refs["inputSearch"].value;
			if (reference.startsWith("#")) {
				reference = this.$refs["inputSearch"].value = reference.slice(1);
				this.$toast.info("Don't include the '#'", {
					autoClose: 1500,
					theme: "dark",
				});
			}
			if (!reference) {
				this.searchResult = "";
				return;
			}
			if (isNaN(+reference)) {
				this.$refs["inputSearch"].value = "";
				this.$toast.info("Reference must be a number", {
					autoClose: 1500,
					theme: "dark",
				});
				return;
			}

			if (this.searchFor === "userStory")
				this.searchTimeout = setTimeout(() => {
					this.searchUserStory(reference);
				}, 500);
			else if (this.searchFor === "epic")
				this.searchTimeout = setTimeout(() => {
					this.searchEpic(reference);
				}, 500);
		},

		async searchUserStory(reference) {
			try {
				this.searchResult = "Searching...";

				const userStory = await this.$store.dispatch("getUserStory", {
					projectId: this.config.originProject,
					userStoryRef: reference,
				});
				this.searchResult = userStory;
			} catch (e) {
				if (e.response?.status === 404)
					this.searchResult = "User story not found.";
				else this.showError(e);
			}
		},

		async searchEpic(reference) {
			try {
				this.searchResult = "Searching...";

				const epic = await this.$store.dispatch("getEpic", {
					projectId: this.config.originProject,
					epicRef: reference,
				});
				this.searchResult = epic;
			} catch (e) {
				if (e.response?.status === 404) this.searchResult = "Epic not found.";
				else this.showError(e);
			}
		},

		executeExport() {
			if (this.searchFor === "userStory")
				this.exportUserStory(this.searchResult);
			else if (this.searchFor === "epic") 
				this.exportEpic(this.searchResult);
		},

		async exportUserStory(US, count = { current: 1, total: 1 }) {
			try {
				if (this.isExporting) return;
				this.isExporting = true;
				// Options validation
				if (this.options.comments && !this.options.attachments)
					throw new Error("Comments cannot be exported without attachments.");
				// Setup progress bar
				const exportSteps = {
					watchers: 1,
					status: 1,
					comments: 2,
					attachments: 2,
					epics: 2,
					tasks: 13,
				};
				// +1 fetch data
				// +1 create user story
				const optionsSteps = Object.keys(this.options).reduce((acc, key) => {
					if (this.options[key] && exportSteps[key]) acc += exportSteps[key];
					return acc;
				}, 0);
				this.exportProgress = {
					total: optionsSteps + 3,
					current: 1,
				};
				// Fetch fresh data of user story and projects
				const originProjectPromise = this.$store.dispatch("getProject", {
					projectId: this.config.originProject,
				});
				const destinationProjectPromise = this.$store.dispatch("getProject", {
					projectId: this.config.destinationProject,
				});
				const userStoryPromise = this.$store.dispatch("getUserStory", {
					projectId: this.config.originProject,
					userStoryRef: US.ref,
				});
				let [originProject, destinationProject, userStory] = await Promise.all([
					originProjectPromise,
					destinationProjectPromise,
					userStoryPromise,
				]);
				this.exportProgress.current++;

				// Build user story data and meta. Meta is used to update the user story after creation.
				const userStoryBuild = await this.buildUserStory({
					userStory,
					originProject,
					destinationProject,
					options: this.options,
					initialData: {
						project: destinationProject.id,
						subject: userStory.subject,
					},
					type: "userStory",
				});
				// Create new user story and update meta
				let newUserStory = await this.$store.dispatch("createUserStory", {
					data: userStoryBuild.data,
				});
				this.exportProgress.current++;
				newUserStory = await this.updateUserStoryMeta(
					"userStory",
					newUserStory,
					userStoryBuild.meta
				);
				// Create tasks
				if (this.options.tasks) {
					const originTasks = await this.$store.dispatch("getTasks", {
						userStoryId: userStory.id,
						projectId: originProject.id,
					});
					for (let originTask of originTasks) {
						originTask = await this.$store.dispatch("getTask", {
							userStoryId: userStory.id,
							projectId: originProject.id,
							taskRef: originTask.ref,
						});
						const taskBuild = await this.buildUserStory({
							userStory: originTask,
							originProject,
							destinationProject,
							initialData: {
								project: destinationProject.id,
								user_story: newUserStory.id,
								subject: originTask.subject,
							},
							type: "task",
							options: {
								assigned_to: true,
								watchers: true,
								description: true,
								tags: true,
								attachments: true,
								comments: true,
								status: true,
							},
						});
						let newTask = await this.$store.dispatch("createTask", {
							userStoryId: newUserStory.id,
							data: taskBuild.data,
						});
						newTask = await this.updateUserStoryMeta(
							"task",
							newTask,
							taskBuild.meta
						);
					}
					this.exportProgress.current++;
				}

				if (count.total > 1) {
					this.$toast.success(
						`User story exported successfully (${count.current}/${count.total})`,
						{
							theme: "dark",
							autoClose: 2000,
						}
					);
				} else {
					this.$toast.success("User story exported successfully", {
						theme: "dark",
						autoClose: 2000,
					});
				}

				this.history.unshift(newUserStory);
				setTimeout(() => {
					this.$refs.inputSearch.select();
				}, 500);
			} catch (e) {
				this.showError(e);
			} finally {
				this.isExporting = false;
				this.exportProgress = {
					total: 0,
					current: 0,
				};
			}
		},

		async exportEpic(epic) {
			const userStories = await this.$store.dispatch("getUserStoriesByEpic", {
				epicId: epic.id,
			});
			for (let i = 0; i < userStories.length; i++) {
				await this.exportUserStory(userStories[i], {
					total: userStories.length,
					current: i + 1,
				});
			}
		},

		async buildUserStory({
			initialData,
			userStory,
			destinationProject,
			originProject,
			type,
			options,
		}) {
			// type === 'userStory' ? userStory === userStory : userStory === task
			const userStoryData = Object.assign({}, initialData);
			const userStoryMeta = {};

			//
			if (options.assigned_to && userStory.assigned_to) {
				await this.verifyMembers([userStory.assigned_to], destinationProject);
				userStoryData.assigned_to = userStory.assigned_to;
			}
			//
			if (options.assigned_users) {
				await this.verifyMembers(userStory.assigned_users, destinationProject);
				userStoryData.assigned_users = userStory.assigned_users || [];
			}
			//
			if (options.watchers) {
				await this.verifyMembers(userStory.watchers, destinationProject);
				userStoryMeta.watchers = userStory.watchers || [];
			}
			//
			if (options.description) {
				userStoryData.description = userStory.description;
			}
			//
			if (options.tags) {
				userStoryData.tags = userStory.tags;
			}
			//
			if (options.attachments) {
				if (type === "task") {
					const attachments = await this.$store.dispatch("getTaskAttachments", {
						projectId: originProject.id,
						taskId: userStory.id,
					});
					userStoryMeta.attachments = attachments;
				} else if (type === "userStory") {
					const attachments = await this.$store.dispatch(
						"getUserStoryAttachments",
						{
							projectId: originProject.id,
							userStoryId: userStory.id,
						}
					);
					userStoryMeta.attachments = attachments;
				}

				this.exportProgress.current++;
			}
			//
			if (options.comments) {
				if (type === "task") {
					const comments = await this.$store.dispatch("getTaskComments", {
						taskId: userStory.id,
					});
					userStoryMeta.comments = comments;
				} else if (type === "userStory") {
					const comments = await this.$store.dispatch("getUserStoryComments", {
						userStoryId: userStory.id,
					});
					userStoryMeta.comments = comments;
				}

				this.exportProgress.current++;
			}
			//
			if (options.status) {
				const statusName = userStory.status_extra_info.name;
				if (type === "userStory") {
					const similiarStatus = destinationProject.us_statuses.find(
						(status) => status.name === statusName
					);
					if (!similiarStatus) {
						const newStatus = await this.$store.dispatch("createStatus", {
							status: {
								name: statusName,
								color: userStory.status_extra_info.color,
								is_closed: userStory.status_extra_info.is_closed,
								project: destinationProject.id,
							},
						});
						userStoryData.status = newStatus.id;
					} else {
						userStoryData.status = similiarStatus.id;
					}
				} else if (type === "task") {
					const similiarStatus = destinationProject.task_statuses.find(
						(status) => status.name === statusName
					);
					if (!similiarStatus) {
						userStoryData.status = destinationProject.default_task_status;
					} else {
						userStoryData.status = similiarStatus.id;
					}
				}

				this.exportProgress.current++;
			}
			//
			if (options.points && userStory.points && typeof userStory.points === "object") {
				const points = {};
				for (const [roleId, pointId] of Object.entries(userStory.points)) {
					const originRole = originProject.roles.find((r) => r.id == roleId);
					const destinationRole = destinationProject.roles.find(
						(r) => r.name === originRole.name
					);

					const originPoint = originProject.points.find((p) => p.id == pointId);
					const destinationPoint = destinationProject.points.find(
						(p) => p.name === originPoint.name
					);

					if (destinationRole && destinationPoint)
						points[destinationRole.id] = destinationPoint.id;
				}
				userStoryData.points = points;
			}
			//
			if (options.epics) {
				if (!originProject.is_epics_activated) userStory.epics = [];
				if (!userStory.epics || !userStory.epics.length) userStory.epics = [];

				if (!destinationProject.is_epics_activated) {
					destinationProject = await this.$store.dispatch("updateProject", {
						projectId: destinationProject.id,
						project: {
							is_epics_activated: true,
						},
					});
				}

				const epics = [];
				const destionationEpics = await this.$store.dispatch("getEpics", {
					projectId: destinationProject.id,
				});
				for (const epic of userStory.epics) {
					const { color, subject } = epic;
					const relatedDestinationEpic = destionationEpics.find(
						(epic) => epic.subject === subject
					);
					if (!relatedDestinationEpic) {
						const newEpic = await this.$store.dispatch("createEpic", {
							epic: {
								color,
								subject,
								project: destinationProject.id,
							},
						});
						epics.push(newEpic.id);
					} else {
						epics.push(relatedDestinationEpic.id);
					}
				}
				userStoryMeta.epics = epics;

				this.exportProgress.current++;
			}

			return { data: userStoryData, meta: userStoryMeta };
		},

		async verifyMembers(members, destinationProject) {
			// Verify members in destination project
			const destinatioProjectMembers = destinationProject.members.map(
				(user) => user.id
			);
			const memberList = Array.isArray(members) ? members : [members];
			const filteredMembers = memberList.filter((userId) => userId);
			for (const userId of filteredMembers) {
				if (!destinatioProjectMembers.includes(userId)) {
					const missingUser = await this.$store.dispatch("getUser", {
						userId,
					});
					throw new Error(
						`User ${missingUser.full_name} is not a member of the destination project.`
					);
				}
			}
		},

		async updateUserStoryMeta(type, userStory, metadata) {
			// type === 'userStory' ? userStory === userStory : userStory === task
			if (metadata.watchers && type === "userStory") {
				const updatedUserStory = await this.$store.dispatch("updateUserStory", {
					id: userStory.id,
					userStory: {
						watchers: metadata.watchers,
						version: userStory.version,
					},
				});
				userStory.watchers = updatedUserStory.watchers;
				userStory.version = updatedUserStory.version;

				this.exportProgress.current++;
			} else if (metadata.watchers && type === "task") {
				const updatedTask = await this.$store.dispatch("updateTask", {
					id: userStory.id,
					task: {
						watchers: metadata.watchers,
						version: userStory.version,
					},
				});
				userStory.watchers = updatedTask.watchers;
				userStory.version = updatedTask.version;

				this.exportProgress.current++;
			}

			if (metadata.attachments) {
				const uploadedAttachments = [];
				for (const attachment of metadata.attachments) {
					const attachmentData = await this.$store.dispatch(
						"fetchAttachment",
						attachment
					); // Uint8Array
					const file = new File([attachmentData], attachment.name);
					const formData = new FormData();
					formData.append("project", userStory.project);
					formData.append("object_id", userStory.id);
					formData.append("attached_file", file);

					let uploadedAttachment;
					if (type === "userStory")
						uploadedAttachment = await this.$store.dispatch(
							"uploadAttachment",
							{ formData }
						);
					else if (type === "task")
						uploadedAttachment = await this.$store.dispatch(
							"uploadTaskAttachment",
							{ formData }
						);

					uploadedAttachment.previous_url = attachment.url;
					uploadedAttachments.push(uploadedAttachment);
				}
				userStory.attachments = uploadedAttachments;

				this.exportProgress.current++;
			}

			if (metadata.comments) {
				const uploadedComments = [];
				metadata.comments.reverse();

				for (let comment of metadata.comments) {
					let urls = comment.comment.match(/\(([^)]+)\)/g);
					if (urls && urls.length) {
						urls = urls.map((url) => url.slice(1, -1));

						for (let i = 0; i < urls.length; i++) {
							const cleanUrl = urls[i].split("?")[0];
							const attachment = userStory.attachments.find(
								(att) => att.previous_url.split("?")[0] === cleanUrl
							);
							if (attachment)
								comment.comment = comment.comment.replace(
									urls[i],
									attachment.url
								);
							else
								comment.comment = comment.comment.replace(
									"![](" + urls[i] + ")",
									""
								);
						}
					}
					if (comment.user.pk !== this.$store.getters.userId)
						comment.comment = `**${comment.user.name}:**\n\n${comment.comment}`;

					if (type === "userStory") {
						const updatedUserStory = await this.$store.dispatch(
							"updateUserStory",
							{
								id: userStory.id,
								userStory: {
									comment: comment.comment,
									version: userStory.version,
								},
							}
						);
						userStory.version = updatedUserStory.version;
					} else if (type === "task") {
						const updatedTask = await this.$store.dispatch("updateTask", {
							id: userStory.id,
							task: {
								comment: comment.comment,
								version: userStory.version,
							},
						});
						userStory.version = updatedTask.version;
					}

					uploadedComments.push(comment.comment);
				}
				userStory.comments = uploadedComments;

				this.exportProgress.current++;
			}

			if (metadata.epics) {
				for (const epic of metadata.epics)
					await this.$store.dispatch("relateEpicToUserStory", {
						epicId: epic,
						userStoryId: userStory.id,
					});
				userStory.epics = metadata.epics;

				this.exportProgress.current++;
			}

			return userStory;
		},

		async deleteStory(id) {
			try {
				await this.$store.dispatch("deleteUserStory", { id });
				this.$toast.success("User story deleted", { theme: "dark", autoClose: 1500 });
				this.history = this.history.filter((story) => story.id !== id);
			} catch (error) {
				this.showError(error);
			}
		},

		showError(error) {
			console.error(error);
			if (error.response?.data?.detail)
				this.$toast.error(error.response.data.detail, { theme: "dark" });
			else if (error.response?.data?._error_message)
				this.$toast.error(error.response.data._error_message, {
					theme: "dark",
				});
			else if (error.message)
				this.$toast.error(error.message, { theme: "dark" });
			else this.$toast.error("Something went wrong", { theme: "dark" });
		},

		logout() {
			this.$router.push({ name: "Auth" });
		},
	},
	mounted() {
		this.fetchProjects();
	},
	watch: {
		searchFor() {
			this.resetSearch();
			this.$refs.inputSearch.focus();
			this.resetHistory();
		},
		showSearchOptions() {
			this.$refs.inputSearch.focus();
		},
	},
};
</script>

<style lang="sass" scoped>
$accent-color: #9debde
$night-color: #1a1d1f
$dark-color: #25292d
$light-grey-color: #3e3e3e

@mixin button
	width: 100%
	padding: 8px 16px
	border: none
	border-radius: 4px
	font-size: 1rem
	cursor: pointer
	font-weight: 600
	font-size: 0.75rem
	text-transform: uppercase
	&:hover
		opacity: 0.8

.home
	height: 100vh
	overflow: auto
	display: flex
	aside
		width: 250px
		display: flex
		flex-direction: column
		background: $dark-color
		border-right: 1px solid $light-grey-color
		.select-container
			display: flex
			flex-direction: column
			align-items: flex-start
			padding: 40px 20px
			color: #fff
			flex: 1
			.title
				margin-bottom: 10px
				text-align: left
				font-size: 0.9rem
				text-transform: uppercase
				font-weight: 600
			select
				width: 100%
				padding: 8px 16px
				color: #fff
				border-radius: 4px
				margin-bottom: 20px
				cursor: pointer
				background: $dark-color
				border: 1px solid $light-grey-color
				font-size: 0.9rem
				&:focus,
				&:hover
					background: $night-color
				&:disabled
					cursor: default
			.buttons
				display: flex
				flex-direction: row
				margin-top: 10px
				width: 100%
				button
					@include button
					background-color: $accent-color
					&.reset
						background: #c2c2c2
		button.logout
			height: 40px
			font-size: 0.75rem
			text-transform: uppercase
			background: $dark-color
			color: #fff
			border: none
			border-top: 1px solid $light-grey-color
			cursor: pointer
			&:hover
				background: $night-color

	main
		flex: 1
		background: $night-color
		display: flex
		flex-wrap: wrap
		align-items: flex-start
		align-content: flex-start
		.search-container
			width: 100%
			display: flex
			flex-wrap: wrap
			width: 100%
			align-items: flex-start
			.input-container
				position: relative
				background: $dark-color
				width: 100%
				input
					width: 100%
					padding: 22px 20px
					border: none
					border-radius: 0px
					border-bottom: 1px solid $light-grey-color
					font-size: 1rem
					position: relative
					background: transparent
					color: #fff
					outline: none
					height: 60px
					&:disabled
						cursor: default
				.progress-bar
					background: $accent-color
					display: block
					height: 1px
					width: 100%
					position: absolute
					bottom: 0
					opacity: 0
					transition: all 0.2s ease
					&.active
						opacity: 1
				button.switch
					display: block
					height: 32px
					background: transparent
					background-repeat: no-repeat
					background-position: center
					background-size: 50%
					border: 1px solid $light-grey-color
					border-radius: 4px
					position: absolute
					text-transform: uppercase
					padding: 0 10px
					color: #fff
					font-size: 0.75rem
					top: 50%
					right: 20px
					transform: translateY(-50%)
					cursor: pointer
					&:hover
						opacity: 0.8
			.search-options
				width: 100%
				background: $dark-color
				display: flex
				border-bottom: 1px solid $light-grey-color
				label
					color: #fff
					display: flex
					justify-content: space-between
					align-items: center
					padding: 0 20px
					height: 39px
					text-transform: uppercase
					font-size: 0.75rem
					cursor: pointer

					input
						margin-right: 10px
						accent-color: $accent-color
				button.hide
					align-self: center
					margin: 0 20px 0 auto
					background: transparent
					border: none
					color: #fff
					cursor: pointer
					text-transform: uppercase
					font-size: 0.75rem
					&:hover
						opacity: 0.8
		.left-side
			display: flex
			flex-direction: column
			width: calc(50% - 30px)
			margin: 20px 10px 20px 20px

			.result-container
				text-align: left
				font-weight: bold
				color: #fff
				width: 100%
				display: flex
				justify-content: space-between
				padding: 20px
				border: 1px solid $light-grey-color
				position: relative
				align-items: center
				border-radius: 4px
				p
					padding-right: 10px
					white-space: nowrap
					text-overflow: ellipsis
					overflow: hidden
				a
					display: inline-block
					height: 32px
					margin-top: 0
					text-align: center
					background-color: transparent
					border: 1px solid $light-grey-color
					border-radius: 4px
					cursor: pointer
					padding: 0 10px
					font-size: 0.75rem
					text-decoration: none
					color: #fff
					font-weight: 400
					display: flex
					align-items: center
					text-transform: uppercase
					&:hover
						opacity: 0.8
				button
					@include button
					margin-top: 10px
					&.export
						background-color: #83eede
						position: absolute
						top: calc(100% + 10px)
						width: 100%
						left: 0
						padding: 12px 0
					&.exporting
						background-color: $light-grey-color
			.history-container
				margin-top: 77px
				border: 1px solid $light-grey-color
				border-radius: 4px
				width: 100%
				color: #fff
				padding: 10px
				&>p
					padding: 10px
					text-transform: uppercase
					font-size: 0.9rem
					font-weight: 600
				ul.history-list
					list-style: none
					padding: 10px
					max-height: 260px
					overflow: auto
					&::-webkit-scrollbar
						width: 5px
					li
						display: flex
						justify-content: space-between
						align-items: center
						&:not(:last-child)
							margin-bottom: 5px
						p
							padding-right: 10px
							white-space: nowrap
							text-overflow: ellipsis
							overflow: hidden
							// max-width: calc(100% - 70px)
							span:first-child
								margin-right: 5px
						.actions-menu
							display: flex
							justify-content: space-between
							align-items: center
							a.view,
							button.delete
								background: transparent
								border: none
								height: 32px
								border: 1px solid $light-grey-color
								border-radius: 4px
								cursor: pointer
								display: flex
								align-items: center
								color: #fff
								text-transform: uppercase
								text-decoration: none
								font-size: 0.75rem
								padding: 0 10px
								&:hover
									opacity: 0.8
							button.delete
								margin-left: 5px
		.export-options
			// margin: 10px 0
			display: flex
			flex-direction: column
			margin: 20px 20px 20px 10px
			color: #fff
			width: 50%
			background: $dark-color
			padding: 10px
			width: calc(50% - 30px)
			border-radius: 4px
			border: 1px solid $light-grey-color
			p
				padding: 10px
				text-transform: uppercase
				font-size: 0.9rem
				font-weight: 600
			label
				cursor: pointer
				padding: 10px
				background: $dark-color
				font-size: 0.9rem
				border-radius: 4px
				user-select: none
				&:hover
					background: $night-color
					input[type="checkbox"]
						&::before
							color: $night-color
							border: 1px solid $night-color
				input[type="checkbox"]
					-webkit-appearance: none
					appearance: none
					background-color: transparent
					border: none
					padding: 0
					margin: 0
					&::before
						-webkit-appearance: checkbox
						appearance: checkbox
						content: "✓"
						display: inline-block
						width: 16px
						height: 16px
						border: 1px solid $dark-color
						box-sizing: border-box
						margin-right: 5px
						color: $dark-color

					&:checked::before
						// background-color: black
						content: "✓"
						color: $accent-color

.step-slide-enter, .step-slide-leave-to
	transform: translateX(100px)
	opacity: 0
.step-slide-enter-active, .step-slide-leave-active
	transition: all 0.5s ease
</style>
