<template>
  <div class="ml-5">
    <h6 class="font-medium my-4 pl-3">
      {{ role?.name }}
    </h6>
    <p class="text-sm mb-4 pl-3">
      {{ role?.description }}
    </p>

    <div
      v-if="isRoleInAccess"
      class="mt-4 pl-3"
    >
      <h6 class="font-medium">
        Capabilities
      </h6>
    </div>

    <RoleItems
      v-if="role && (role.id === 'owner' || role.id === 'admin')"
      :role="role || { id: '' }"
      :items="ProjectSettingsItems"
      title="Project Settings"
      :hide-if-guest="true"
    />

    <RoleItems
      v-if="role && role.id !== 'guest'"
      :role="role || { id: '' }"
      :items="SiteItems"
      title="Sites"
      :hide-if-guest="true"
    />

    <RoleItems
      v-if="role && role.id !== 'guest'"
      :role="role || { id: '' }"
      :items="SpeciesItems"
      :hide-if-guest="true"
      title="Species"
    />

    <RoleItems
      v-if="role && role.id !== 'guest'"
      :role="role || { id: '' }"
      :items="RecordingsItems"
      :hide-if-guest="true"
      title="Recordings"
    />

    <RoleItems
      v-if="role && role.id === 'data-entry'"
      :role="role || { id: '' }"
      :items="ProjectSettingsItems"
      title="Project Settings"
      :hide-if-guest="true"
      :reduce-opacity="role && role.id === 'data-entry'"
      :is-unavailable="role && role.id === 'data-entry'"
    />

    <RoleItems
      v-if="role && role.id !== 'guest'"
      :role="role || { id: '' }"
      :items="PlaylistsItems"
      title="Playlists"
      :hide-if-guest="true"
      :reduce-opacity="role && (role.id === 'data-entry')"
      :is-unavailable="role && (role.id === 'data-entry')"
    />

    <RoleItems
      v-if="role && role.id === 'user'"
      :role="role || { id: '' }"
      :items="ProjectSettingsItems"
      title="Project Settings"
      :hide-if-guest="true"
      :reduce-opacity="role && role.id === 'user'"
      :is-unavailable="role && role.id === 'user'"
    />

    <RoleItems
      v-if="role && role.id !== 'guest'"
      :role="role || { id: '' }"
      :items="JobsItems"
      title="Jobs"
      :hide-if-guest="true"
      :reduce-opacity="role && (role.id === 'user' || role.id === 'data-entry')"
      :is-unavailable="role && (role.id === 'user' || role.id === 'data-entry')"
    />

    <RoleItems
      v-if="role && role.id !== 'guest'"
      :role="role || { id: '' }"
      :items="ValidationsItems"
      title="Validations"
      :hide-if-guest="true"
      :reduce-opacity="role && (role.id === 'user' || role.id === 'data-entry')"
      :is-unavailable="role && (role.id === 'user' || role.id === 'data-entry')"
    />

    <RoleItems
      v-if="role && role.id === 'expert'"
      :role="role || { id: '' }"
      :items="ProjectSettingsItems"
      title="Project Settings"
      :hide-if-guest="true"
      :reduce-opacity="role && (role.id === 'expert')"
      :is-unavailable="role && (role.id === 'expert')"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import RoleItems from './components/role-items.vue'

const props = defineProps<{ id: string }>()

interface Role {
  id: string;
  name: string;
  description: string;
}

const roles: Record<string, Role> = {
  owner: { id: 'owner', name: 'Owner', description: 'Project Owner - can manage and delete the project, edit project settings, and manage project members' },
  admin: { id: 'admin', name: 'Admin', description: 'Project Administrator - can view and manage the project, edit project settings, and manage project members' },
  expert: { id: 'expert', name: 'Expert', description: 'Project Member + Species Validator - can view and manage the project, run jobs, and validate species' },
  user: { id: 'user', name: 'User', description: 'Project Member - can view the project, manage project species, manage recordings, view and create playlists' },
  'data-entry': { id: 'data-entry', name: 'Data Entry', description: 'Limited Project Member - can view the project, manage project species, and manage recordings' },
  guest: { id: 'guest', name: 'Guest', description: 'Project Guest - can view the project (and be Citizen Scientist if enabled)' }
}

const role = computed<Role | undefined>(() => roles[props.id])

const ProjectSettingsItems = [
  { title: 'Manage memberships', access: { owner: true, admin: true } },
  { title: 'Edit project information', access: { owner: true, admin: true } },
  { title: 'Delete project', access: { owner: true, admin: false } }
]

const SiteItems = [
  { title: 'Create new sites', access: { owner: true, admin: true, expert: true, user: true, 'data-entry': false } },
  { title: 'Edit site information', access: { owner: true, admin: true, expert: true, user: true, 'data-entry': false } },
  { title: 'Export sites in csv.', access: { owner: true, admin: true, expert: true, user: true, 'data-entry': true } },
  { title: 'Delete sites', access: { owner: true, admin: true, expert: true, user: false, 'data-entry': false } }
]

const SpeciesItems = [
  { title: 'Add new species', access: { owner: true, admin: true, expert: true, user: true, 'data-entry': true } },
  { title: 'Delete species', access: { owner: true, admin: true, expert: true, user: true, 'data-entry': true } }
]

const RecordingsItems = [
  { title: 'Upload new recordings', access: { owner: true, admin: true, expert: true, user: true, 'data-entry': true } },
  { title: 'Delete recordings', access: { owner: true, admin: true, expert: true, user: false, 'data-entry': true } },
  { title: 'Export recordings', access: { owner: true, admin: true, expert: true, user: true, 'data-entry': true } }
]

const PlaylistsItems = [
  { title: 'Create new playlists', access: { owner: true, admin: true, expert: true, user: true, 'data-entry': false } },
  { title: 'Edit playlist', access: { owner: true, admin: true, expert: true, user: true, 'data-entry': false } },
  { title: 'Delete playlist', access: { owner: true, admin: true, expert: true, user: true, 'data-entry': false } },
  { title: 'Export playlist', access: { owner: true, admin: true, expert: true, user: true, 'data-entry': false } }
]

const JobsItems = [
  { title: 'Create new jobs', access: { owner: true, admin: true, expert: true, user: false, 'data-entry': false } },
  { title: 'Edit jobs', access: { owner: true, admin: true, expert: true, user: false, 'data-entry': false } },
  { title: 'Delete jobs', access: { owner: true, admin: true, expert: true, user: false, 'data-entry': false } },
  { title: 'Export jobs', access: { owner: true, admin: true, expert: true, user: false, 'data-entry': false } }
]

const ValidationsItems = [
  { title: 'Add new validations', access: { owner: true, admin: true, expert: true, user: false, 'data-entry': false } },
  { title: 'Delete validations', access: { owner: true, admin: true, expert: true, user: false, 'data-entry': false } },
  { title: 'Export validations', access: { owner: true, admin: true, expert: true, user: false, 'data-entry': false } }
]

const isRoleInAccess = computed(() => {
  const roleId = role.value?.id
  if (roleId && roleId in ProjectSettingsItems[0].access) {
    return ProjectSettingsItems.some(item => item.access[roleId as keyof typeof ProjectSettingsItems[0]['access']] === true)
  }
  return false
})
</script>
