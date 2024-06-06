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
      :if-unavailable="role && role.id === 'data-entry'"
    />

    <RoleItems
      v-if="role && role.id !== 'guest'"
      :role="role || { id: '' }"
      :items="PlaylistsItems"
      title="Playlists"
      :hide-if-guest="true"
      :reduce-opacity="role && (role.id === 'data-entry')"
      :if-unavailable="role && (role.id === 'data-entry')"
    />

    <RoleItems
      v-if="role && role.id === 'user'"
      :role="role || { id: '' }"
      :items="ProjectSettingsItems"
      title="Project Settings"
      :hide-if-guest="true"
      :reduce-opacity="role && role.id === 'user'"
      :if-unavailable="role && role.id === 'user'"
    />

    <RoleItems
      v-if="role && role.id !== 'guest'"
      :role="role || { id: '' }"
      :items="JobsItems"
      title="Jobs"
      :hide-if-guest="true"
      :reduce-opacity="role && (role.id === 'user' || role.id === 'data-entry')"
      :if-unavailable="role && (role.id === 'user' || role.id === 'data-entry')"
    />

    <RoleItems
      v-if="role && role.id !== 'guest'"
      :role="role || { id: '' }"
      :items="ValidationsItems"
      title="Validations"
      :hide-if-guest="true"
      :reduce-opacity="role && (role.id === 'user' || role.id === 'data-entry')"
      :if-unavailable="role && (role.id === 'user' || role.id === 'data-entry')"
    />

    <RoleItems
      v-if="role && role.id === 'expert'"
      :role="role || { id: '' }"
      :items="ProjectSettingsItems"
      title="Project Settings"
      :hide-if-guest="true"
      :reduce-opacity="role && (role.id === 'expert')"
      :if-unavailable="role && (role.id === 'expert')"
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

const role = computed<Role | undefined>(() => roles.find(role => role.id === props.id))

const roles: Role[] = [
  { id: 'owner', name: 'Owner', description: 'Project Owner - can manage and delete the project, edit project settings, and manage project members' },
  { id: 'admin', name: 'Admin', description: 'Project Administrator - can view and manage the project, edit project settings, and manage project members' },
  { id: 'expert', name: 'Expert', description: 'Project Member + Species Validator - can view and manage the project, run jobs, and validate species' },
  { id: 'user', name: 'User', description: 'Project Member - can view the project, manage project species, manage recordings, view and create playlists' },
  { id: 'data-entry', name: 'Data Entry', description: 'Limited Project Member - can view the project, manage project species, and manage recordings' },
  { id: 'guest', name: 'Guest', description: 'Project Guest - can view the project (and be Citizen Scientist if enabled)' }
]

const ProjectSettingsItems = [
  { title: 'Manage memberships', access: [{ id: 'owner', permission: 'allow' }, { id: 'admin', permission: 'allow' }] },
  { title: 'Edit project information', access: [{ id: 'owner', permission: 'allow' }, { id: 'admin', permission: 'allow' }] },
  { title: 'Delete project', access: [{ id: 'owner', permission: 'allow' }, { id: 'admin', permission: 'impervious' }] }
]

const SiteItems = [
  { title: 'Create new sites', access: [{ id: 'owner', permission: 'allow' }, { id: 'admin', permission: 'allow' }, { id: 'expert', permission: 'allow' }, { id: 'user', permission: 'allow' }, { id: 'data-entry', permission: 'impervious' }] },
  { title: 'Edit site information', access: [{ id: 'owner', permission: 'allow' }, { id: 'admin', permission: 'allow' }, { id: 'expert', permission: 'allow' }, { id: 'user', permission: 'allow' }, { id: 'data-entry', permission: 'impervious' }] },
  { title: 'Export sites in csv.', access: [{ id: 'owner', permission: 'allow' }, { id: 'admin', permission: 'allow' }, { id: 'expert', permission: 'allow' }, { id: 'user', permission: 'allow' }, { id: 'data-entry', permission: 'allow' }] },
  { title: 'Delete sites', access: [{ id: 'owner', permission: 'allow' }, { id: 'admin', permission: 'allow' }, { id: 'expert', permission: 'allow' }, { id: 'user', permission: 'impervious' }, { id: 'data-entry', permission: 'impervious' }] }
]

const SpeciesItems = [
  { title: 'Add new species', access: [{ id: 'owner', permission: 'allow' }, { id: 'admin', permission: 'allow' }, { id: 'expert', permission: 'allow' }, { id: 'user', permission: 'allow' }, { id: 'data-entry', permission: 'allow' }] },
  { title: 'Delete species', access: [{ id: 'owner', permission: 'allow' }, { id: 'admin', permission: 'allow' }, { id: 'expert', permission: 'allow' }, { id: 'user', permission: 'allow' }, { id: 'data-entry', permission: 'allow' }] }
]

const RecordingsItems = [
  { title: 'Upload new recordings', access: [{ id: 'owner', permission: 'allow' }, { id: 'admin', permission: 'allow' }, { id: 'expert', permission: 'allow' }, { id: 'user', permission: 'allow' }, { id: 'data-entry', permission: 'allow' }] },
  { title: 'Delete recordings', access: [{ id: 'owner', permission: 'allow' }, { id: 'admin', permission: 'allow' }, { id: 'expert', permission: 'allow' }, { id: 'user', permission: 'impervious' }, { id: 'data-entry', permission: 'allow' }] },
  { title: 'Export recordings', access: [{ id: 'owner', permission: 'allow' }, { id: 'admin', permission: 'allow' }, { id: 'expert', permission: 'allow' }, { id: 'user', permission: 'allow' }, { id: 'data-entry', permission: 'allow' }] }
]

const PlaylistsItems = [
  { title: 'Create new playlists', access: [{ id: 'owner', permission: 'allow' }, { id: 'admin', permission: 'allow' }, { id: 'expert', permission: 'allow' }, { id: 'user', permission: 'allow' }, { id: 'data-entry', permission: 'impervious' }] },
  { title: 'Edit playlist', access: [{ id: 'owner', permission: 'allow' }, { id: 'admin', permission: 'allow' }, { id: 'expert', permission: 'allow' }, { id: 'user', permission: 'impervious' }, { id: 'data-entry', permission: 'impervious' }] },
  { title: 'Delete playlist', access: [{ id: 'owner', permission: 'allow' }, { id: 'admin', permission: 'allow' }, { id: 'expert', permission: 'allow' }, { id: 'user', permission: 'allow' }, { id: 'data-entry', permission: 'impervious' }] },
  { title: 'Export playlist', access: [{ id: 'owner', permission: 'allow' }, { id: 'admin', permission: 'allow' }, { id: 'expert', permission: 'allow' }, { id: 'user', permission: 'allow' }, { id: 'data-entry', permission: 'impervious' }] }
]

const JobsItems = [
  { title: 'Create new jobs', access: [{ id: 'owner', permission: 'allow' }, { id: 'admin', permission: 'allow' }, { id: 'expert', permission: 'allow' }, { id: 'user', permission: 'impervious' }, { id: 'data-entry', permission: 'impervious' }] },
  { title: 'Edit jobs', access: [{ id: 'owner', permission: 'allow' }, { id: 'admin', permission: 'allow' }, { id: 'expert', permission: 'allow' }, { id: 'user', permission: 'impervious' }, { id: 'data-entry', permission: 'impervious' }] },
  { title: 'Delete jobs', access: [{ id: 'owner', permission: 'allow' }, { id: 'admin', permission: 'allow' }, { id: 'expert', permission: 'allow' }, { id: 'user', permission: 'impervious' }, { id: 'data-entry', permission: 'impervious' }] },
  { title: 'Export jobs', access: [{ id: 'owner', permission: 'allow' }, { id: 'admin', permission: 'allow' }, { id: 'expert', permission: 'allow' }, { id: 'user', permission: 'impervious' }, { id: 'data-entry', permission: 'impervious' }] }
]

const ValidationsItems = [
  { title: 'Add new validations', access: [{ id: 'owner', permission: 'allow' }, { id: 'admin', permission: 'allow' }, { id: 'expert', permission: 'allow' }, { id: 'user', permission: 'impervious' }, { id: 'data-entry', permission: 'impervious' }] },
  { title: 'Delete validations', access: [{ id: 'owner', permission: 'allow' }, { id: 'admin', permission: 'allow' }, { id: 'expert', permission: 'allow' }, { id: 'user', permission: 'impervious' }, { id: 'data-entry', permission: 'impervious' }] },
  { title: 'Export validations', access: [{ id: 'owner', permission: 'allow' }, { id: 'admin', permission: 'allow' }, { id: 'expert', permission: 'allow' }, { id: 'user', permission: 'impervious' }, { id: 'data-entry', permission: 'impervious' }] }
]

const isRoleInAccess = computed(() => {
  return role.value?.id !== '' && ProjectSettingsItems.some(item => item.access.some(access => access.id === role.value?.id))
})
</script>

<style>

</style>
