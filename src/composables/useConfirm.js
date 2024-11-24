import { ref } from 'vue'

const confirmDialog = ref({
  show: false,
  title: '',
  message: '',
  confirmText: 'Confirmer',
  cancelText: 'Annuler',
  type: 'warning',
  resolve: null
})

export function useConfirm() {
  const confirm = ({
    title = 'Confirmation',
    message = 'Êtes-vous sûr ?',
    confirmText = 'Confirmer',
    cancelText = 'Annuler',
    type = 'warning'
  } = {}) => {
    confirmDialog.value = {
      show: true,
      title,
      message,
      confirmText,
      cancelText,
      type
    }

    return new Promise((resolve) => {
      confirmDialog.value.resolve = resolve
    })
  }

  const handleConfirm = () => {
    if (confirmDialog.value.resolve) {
      confirmDialog.value.resolve(true)
    }
    confirmDialog.value.show = false
  }

  const handleCancel = () => {
    if (confirmDialog.value.resolve) {
      confirmDialog.value.resolve(false)
    }
    confirmDialog.value.show = false
  }

  return {
    confirm,
    confirmDialog,
    handleConfirm,
    handleCancel
  }
} 