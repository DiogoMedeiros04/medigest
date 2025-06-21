import { supabase } from './supabaseClient.js'

const form = document.getElementById('profile-form')
const nomeInput = document.getElementById('nome')
const avatarFile = document.getElementById('avatarFile')
const preview = document.getElementById('preview')
const status = document.getElementById('status')

let avatarPublicUrl = null

// Mostrar preview da imagem
avatarFile.addEventListener('change', () => {
  const file = avatarFile.files[0]
  if (file) {
    preview.src = URL.createObjectURL(file)
    preview.style.display = 'block'
  }
})

// Submeter formulário
form.addEventListener('submit', async (e) => {
  e.preventDefault()
  status.textContent = ''

  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id
  if (!userId) {
    status.innerHTML = '<div class="alert alert-danger">Sessão expirada.</div>'
    return
  }

  // Fazer upload da imagem
  if (avatarFile.files.length > 0) {
    const file = avatarFile.files[0]
    const fileName = `${userId}-${Date.now()}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      status.innerHTML = `<div class="alert alert-danger">Erro ao subir imagem: ${uploadError.message}</div>`
      return
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)
    avatarPublicUrl = data.publicUrl
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: nomeInput.value,
      avatar_url: avatarPublicUrl || preview.src
    })
    .eq('user_id', userId)

  if (error) {
    status.innerHTML = `<div class="alert alert-danger">Erro: ${error.message}</div>`
  } else {
    status.innerHTML = '<div class="alert alert-success">✅ Perfil atualizado com sucesso!</div>'
  }
})
