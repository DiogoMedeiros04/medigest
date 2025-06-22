import { supabase } from './supabaseClient.js'

const form = document.getElementById('signup-form')

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const roleInput = document.querySelector('input[name="role"]:checked')
  const role = roleInput ? roleInput.value : null

  if (!role) {
    alert('Por favor, seleciona o tipo de utilizador.')
    return
  }

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    alert('Erro no registo: ' + error.message)
    return
  }

  const user = data.user
  const userId = user?.id || data?.session?.user?.id

  const { error: profileError } = await supabase.from('profiles').insert([
    { user_id: userId, role }
  ])

  if (profileError) {
    alert('Erro ao guardar perfil: ' + profileError.message)
    return
  }

  alert('Conta criada com sucesso!')
  window.location.href = 'login.html'
})
