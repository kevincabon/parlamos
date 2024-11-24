<template>
  <TransitionRoot appear :show="show" as="template">
    <div class="fixed top-4 right-4 z-50 w-full max-w-md px-4 sm:px-0">
      <TransitionChild
        enter="transform ease-out duration-300 transition"
        enter-from="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to="translate-y-0 opacity-100 sm:translate-x-0"
        leave="transition ease-in duration-100"
        leave-from="opacity-100"
        leave-to="opacity-0"
        as="template"
      >
        <div 
          class="w-full overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 backdrop-blur-sm"
          :class="{
            'bg-green-900/70 ring-green-500/20': type === 'success',
            'bg-red-900/70 ring-red-500/20': type === 'error',
            'bg-blue-900/70 ring-blue-500/20': type === 'info',
            'bg-yellow-900/70 ring-yellow-500/20': type === 'warning'
          }"
        >
          <div class="p-4">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <svg
                  v-if="type === 'success'"
                  class="h-5 w-5 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg
                  v-else-if="type === 'error'"
                  class="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <svg
                  v-else-if="type === 'info'"
                  class="h-5 w-5 text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg
                  v-else
                  class="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <div class="ml-3 flex-1">
                <p 
                  class="text-sm font-medium"
                  :class="{
                    'text-green-100': type === 'success',
                    'text-red-100': type === 'error',
                    'text-blue-100': type === 'info',
                    'text-yellow-100': type === 'warning'
                  }"
                >
                  {{ title }}
                </p>
                <p 
                  class="mt-1 text-xs"
                  :class="{
                    'text-green-200': type === 'success',
                    'text-red-200': type === 'error',
                    'text-blue-200': type === 'info',
                    'text-yellow-200': type === 'warning'
                  }"
                >
                  {{ message }}
                </p>
              </div>

              <div class="ml-3 flex flex-shrink-0">
                <button
                  @click="$emit('close')"
                  class="inline-flex rounded-md p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  :class="{
                    'text-green-300 hover:text-green-200 hover:bg-green-800/50 focus:ring-green-500': type === 'success',
                    'text-red-300 hover:text-red-200 hover:bg-red-800/50 focus:ring-red-500': type === 'error',
                    'text-blue-300 hover:text-blue-200 hover:bg-blue-800/50 focus:ring-blue-500': type === 'info',
                    'text-yellow-300 hover:text-yellow-200 hover:bg-yellow-800/50 focus:ring-yellow-500': type === 'warning'
                  }"
                >
                  <span class="sr-only">Fermer</span>
                  <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </TransitionChild>
    </div>
  </TransitionRoot>
</template>

<script setup>
import { TransitionRoot, TransitionChild } from '@headlessui/vue'

defineProps({
  show: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'info',
    validator: value => ['success', 'error', 'info', 'warning'].includes(value)
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
})

defineEmits(['close'])
</script> 