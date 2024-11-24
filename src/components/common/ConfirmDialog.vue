<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <!-- Overlay -->
      <div class="fixed inset-0 bg-black/75" @click="$emit('cancel')" />

      <!-- Dialog -->
      <div class="relative bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
        <div class="text-center">
          <!-- Icône -->
          <div :class="{
            'mx-auto flex h-12 w-12 items-center justify-center rounded-full': true,
            'bg-yellow-500/20': type === 'warning',
            'bg-red-500/20': type === 'danger',
            'bg-blue-500/20': type === 'info'
          }">
            <span :class="{
              'text-2xl': true,
              'text-yellow-500': type === 'warning',
              'text-red-500': type === 'danger',
              'text-blue-500': type === 'info'
            }">
              {{ getIcon }}
            </span>
          </div>

          <!-- Titre et message -->
          <div class="mt-4">
            <h3 class="text-lg font-medium text-gray-100">
              {{ title }}
            </h3>
            <p class="mt-2 text-sm text-gray-400">
              {{ message }}
            </p>
          </div>
        </div>

        <!-- Boutons -->
        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="$emit('cancel')"
            class="btn bg-gray-700 hover:bg-gray-600"
          >
            {{ cancelText }}
          </button>
          <button
            @click="$emit('confirm')"
            :class="{
              'btn': true,
              'bg-yellow-500 hover:bg-yellow-600': type === 'warning',
              'bg-red-500 hover:bg-red-600': type === 'danger',
              'bg-blue-500 hover:bg-blue-600': type === 'info'
            }"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  title: String,
  message: String,
  confirmText: {
    type: String,
    default: 'Confirmer'
  },
  cancelText: {
    type: String,
    default: 'Annuler'
  },
  type: {
    type: String,
    default: 'warning',
    validator: (value) => ['warning', 'danger', 'info'].includes(value)
  }
})

const getIcon = computed(() => {
  switch (props.type) {
    case 'warning':
      return '⚠️'
    case 'danger':
      return '🗑️'
    case 'info':
      return 'ℹ️'
    default:
      return '⚠️'
  }
})

defineEmits(['update:modelValue', 'confirm', 'cancel'])
</script> 