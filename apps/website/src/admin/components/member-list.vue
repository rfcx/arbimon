<template>
  <table class="w-full text-left rtl:text-right table-auto">
    <thead class="border-y-1 border-util-gray-03 text-fog text-sm">
      <tr>
        <th class="px-2 py-3">
          Name
        </th>
        <th>
          Email
        </th>
        <th>
          Role
        </th>
        <th>
          Actions
        </th>
      </tr>
    </thead>
    <tfoot>
      <tr>
        <td
          colspan="4"
          class="py-3"
        >
          <input
            type="email"
            class="border-0 w-full rounded-md px-2 py-1 input-field"
            placeholder="+ Add new member by email"
          >
        </td>
      </tr>
    </tfoot>
    <tbody>
      <tr
        v-for="member in members"
        :key="member.id"
        class="border-y-1 border-util-gray-03"
      >
        <td class="px-2 py-3">
          {{ member.name }}
        </td>
        <td class="px-2 py-3">
          {{ member.email }}
        </td>
        <td class="px-2 py-3">
          {{ member.role }}
        </td>
        <td class="px-2 py-3">
          <button class="text-sm text-insight bg-ibis rounded-md px-2 py-1">
            Delete
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
interface Member {
  id: number
  name: string
  email: string
  role: string
}
const members: Member[] = [
  { id: 1, name: 'John Doe', email: 'john@cx.com', role: 'Admin' },
  { id: 2, name: 'Jane Doe', email: 'jane@cy.com', role: 'Member' }
]

</script>
