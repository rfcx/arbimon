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
  { title: 'Manage memberships', access: { owner: 'allow', admin: 'allow' } },
  { title: 'Edit project information', access: { owner: 'allow', admin: 'allow' } },
  { title: 'Delete project', access: { owner: 'allow', admin: 'impervious' } }
]

const SiteItems = [
  { title: 'Create new sites', access: { owner: 'allow', admin: 'allow', expert: 'allow', user: 'allow', 'data-entry': 'impervious' } },
  { title: 'Edit site information', access: { owner: 'allow', admin: 'allow', expert: 'allow', user: 'allow', 'data-entry': 'impervious' } },
  { title: 'Export sites in csv.', access: { owner: 'allow', admin: 'allow', expert: 'allow', user: 'allow', 'data-entry': 'allow' } },
  { title: 'Delete sites', access: { owner: 'allow', admin: 'allow', expert: 'allow', user: 'impervious', 'data-entry': 'impervious' } }
]

const SpeciesItems = [
  { title: 'Add new species', access: { owner: 'allow', admin: 'allow', expert: 'allow', user: 'allow', 'data-entry': 'allow' } },
  { title: 'Delete species', access: { owner: 'allow', admin: 'allow', expert: 'allow', user: 'allow', 'data-entry': 'allow' } }
]

const RecordingsItems = [
  { title: 'Upload new recordings', access: { owner: 'allow', admin: 'allow', expert: 'allow', user: 'allow', 'data-entry': 'allow' } },
  { title: 'Delete recordings', access: { owner: 'allow', admin: 'allow', expert: 'allow', user: 'impervious', 'data-entry': 'allow' } },
  { title: 'Export recordings', access: { owner: 'allow', admin: 'allow', expert: 'allow', user: 'allow', 'data-entry': 'allow' } }
]

const PlaylistsItems = [
  { title: 'Create new playlists', access: { owner: 'allow', admin: 'allow', expert: 'allow', user: 'allow', 'data-entry': 'impervious' } },
  { title: 'Edit playlist', access: { owner: 'allow', admin: 'allow', expert: 'allow', user: 'impervious', 'data-entry': 'impervious' } },
  { title: 'Delete playlist', access: { owner: 'allow', admin: 'allow', expert: 'allow', user: 'allow', 'data-entry': 'impervious' } },
  { title: 'Export playlist', access: { owner: 'allow', admin: 'allow', expert: 'allow', user: 'allow', 'data-entry': 'impervious' } }
]

const JobsItems = [
  { title: 'Create new jobs', access: { owner: 'allow', admin: 'allow', expert: 'allow', user: 'impervious', 'data-entry': 'impervious' } },
  { title: 'Edit jobs', access: { owner: 'allow', admin: 'allow', expert: 'allow', user: 'impervious', 'data-entry': 'impervious' } },
  { title: 'Delete jobs', access: { owner: 'allow', admin: 'allow', expert: 'allow', user: 'impervious', 'data-entry': 'impervious' } },
  { title: 'Export jobs', access: { owner: 'allow', admin: 'allow', expert: 'allow', user: 'impervious', 'data-entry': 'impervious' } }
]

const ValidationsItems = [
  { title: 'Add new validations', access: { owner: 'allow', admin: 'allow', expert: 'allow', user: 'impervious', 'data-entry': 'impervious' } },
  { title: 'Delete validations', access: { owner: 'allow', admin: 'allow', expert: 'allow', user: 'impervious', 'data-entry': 'impervious' } },
  { title: 'Export validations', access: { owner: 'allow', admin: 'allow', expert: 'allow', user: 'impervious', 'data-entry': 'impervious' } }
]

const isRoleInAccess = computed(() => {
  const roleId = role.value?.id
  if (roleId && roleId in ProjectSettingsItems[0].access) {
    return ProjectSettingsItems.some(item => item.access[roleId as keyof typeof ProjectSettingsItems[0]['access']] === 'allow')
  }
  return false
})
</script>
