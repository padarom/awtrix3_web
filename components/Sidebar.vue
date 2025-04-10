<template>
  <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6">
    <div class="flex h-32 shrink-0 items-center space-x-4">
      <img class="h-16 w-auto" src="https://cdn.jsdelivr.net/gh/Blueforcer/awtrix3_web_test/images/icon.png" alt="Your Company" />
      <h1 uppercase text="white 2xl" font="black">Awtrix 3</h1>
    </div>
    <nav class="flex flex-1 flex-col">
      <ul role="list" class="flex flex-1 flex-col gap-y-7 justify-between">
        <li>
          <ul role="list" class="-mx-2 space-y-1">
            <li v-for="item in navigation" :key="item.name">
              <NuxtLink
                  :to="item.href"
                  :class="['text-gray-400 hover:bg-gray-800 hover:text-white', 'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold']"
                  active-class="bg-gray-800 text-white"
              >
                <component :is="item.icon" class="size-6 shrink-0" aria-hidden="true" />
                {{ item.name }}
                <span v-if="item.count" class="ml-auto w-9 min-w-max whitespace-nowrap rounded-full bg-gray-900 px-2.5 py-0.5 text-center text-xs/5 font-medium text-white ring-1 ring-inset ring-gray-700" aria-hidden="true">{{ item.count }}</span>
              </NuxtLink>
            </li>
          </ul>
        </li>

        <li m="b-4">
          <div text="xs/6 gray-400" font="semibold">External links</div>
          <ul role="list" space-y-1 class="-mx-2 mt-2">
            <li v-for="link in externalLinks" :key="link.name">
              <a :href="link.href" target="_blank" class="text-gray-400 hover:bg-gray-800 hover:text-white group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold">
                <span class="flex size-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">{{ link.initial }}</span>
                <span class="truncate">{{ link.name }}</span>
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import {
  CalendarIcon,
  ChartPieIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
} from '@heroicons/vue/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, count: '5' },
  { name: 'Icons', href: '/icons', icon: CalendarIcon, count: '20+' },
  { name: 'MQTT', href: '/mqtt', icon: UsersIcon },
  { name: 'Network', href: '/network', icon: FolderIcon, count: '12' },
]

const externalLinks = [
  { id: 3, name: 'Documentation', href: '#', initial: 'D' },
  { id: 1, name: 'Community', href: '#', initial: 'C' },
  { id: 2, name: 'Awtrix Flows', href: '#', initial: 'F' },
]
</script>