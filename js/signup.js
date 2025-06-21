import { supabase } from './supabaseClient.js'

const form = document.getElementById('signup-form')

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const role = document.getElementById('role').value

  // register supabse
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) {
    alert('Erro no registo: ' + error.message)
    return
  }

  const user = data.user
  const userId = user?.id || data?.session?.user?.id

  // guardar no perfil //antigo ig
  const { error: profileError } = await supabase.from('profiles').insert([
    {
      user_id: userId,
      role
    }
  ])

  if (profileError) {
    alert('Erro ao guardar perfil: ' + profileError.message)
    return
  }

  alert('Conta criada com sucesso!')
  window.location.href = 'login.html'
})
