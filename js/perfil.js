/*import { supabase } from './supabaseClient.js'

const userIdSpan = document.getElementById('user-id')
const copyBtn = document.getElementById('copy-btn')

async function showUserId() {
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) {
    userIdSpan.textContent = 'Não autenticado.'
    return
  }

  userIdSpan.textContent = user.id

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(user.id)
    alert('Código copiado para a área de transferência!')
  })
}

showUserId()*/
