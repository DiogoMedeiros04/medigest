import { supabase } from './supabaseClient.js'

const form = document.getElementById('login-form')

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  // Login no Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    alert('Erro no login: ' + error.message)
    return
  }

  const user = data.user
  const userId = user.id

  // Buscar perfil do utilizador
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userId)
    .single()

  if (profileError || !profile) {
    alert('Erro ao obter o perfil do utilizador.')
    return
  }

  // Redireciona com base no role
  if (profile.role === 'admin') {
    window.location.href = 'admin-dashboard.html'
  } else if (profile.role === 'patient') {
    window.location.href = 'patient-dashboard.html'
  } else {
    alert('Tipo de utilizador desconhecido.')
  }
})
