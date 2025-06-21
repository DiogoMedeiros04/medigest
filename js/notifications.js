// js/notifications.js

export async function pedirPermissaoNotificacoes() {
  if (!('Notification' in window)) {
    alert('Este navegador não suporta notificações.');
    return false;
  }

  const permissao = await Notification.requestPermission()
  return permissao === 'granted'
}

export function mostrarNotificacao(titulo, opcoes = {}) {
  if (Notification.permission === 'granted') {
    new Notification(titulo, opcoes)
  }
}
