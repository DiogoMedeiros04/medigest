import { supabase } from './supabaseClient.js'

let editingMedicationId = null

const form = document.getElementById('medication-form')
const status = document.getElementById('status')
const listaContainer = document.getElementById('lista-meds-container')

const associarBtn = document.getElementById('associar-btn')
const pacienteIdInput = document.getElementById('pacienteId')
const associarStatus = document.getElementById('associar-status')
const pacientesContainer = document.getElementById('pacientes-container')

async function getAdminId() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id || null
}

// === CRIAR/EDITAR MEDICAMENTO ===
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    status.innerText = ''
    const adminId = await getAdminId()
    if (!adminId) {
      alert("Sessão inválida. Faz login novamente.")
      return
    }

    const name = document.getElementById('name').value
    const dosage = document.getElementById('dosage').value
    const frequency = document.getElementById('frequency').value
    const startDate = document.getElementById('startDate').value
    const endDate = document.getElementById('endDate').value

    if (editingMedicationId) {
      const { error } = await supabase
        .from('medications')
        .update({ name, dosage, frequency, start_date: startDate, end_date: endDate })
        .eq('id', editingMedicationId)

      if (error) {
        status.textContent = 'Erro ao atualizar: ' + error.message
        return
      }

      status.textContent = 'Medicamento atualizado!'
      editingMedicationId = null
      form.reset()
      form.querySelector('button').innerText = 'Criar Medicamento'
    } else {
      const { error } = await supabase
        .from('medications')
        .insert([{ admin_id: adminId, name, dosage, frequency, start_date: startDate, end_date: endDate }])

      if (error) {
        status.textContent = 'Erro ao criar: ' + error.message
        return
      }

      status.textContent = 'Medicamento criado com sucesso!'
      form.reset()
    }

    carregarMedicamentosDoAdmin()
  })
}

function preencherFormulario(med) {
  editingMedicationId = med.id
  document.getElementById('name').value = med.name
  document.getElementById('dosage').value = med.dosage
  document.getElementById('frequency').value = med.frequency
  document.getElementById('startDate').value = med.start_date
  document.getElementById('endDate').value = med.end_date
  form.querySelector('button').innerText = 'Atualizar Medicamento'
}

async function carregarMedicamentosDoAdmin() {
  const adminId = await getAdminId()
  const { data: meds, error } = await supabase
    .from('medications')
    .select('*')
    .eq('admin_id', adminId)

  if (error || !meds || meds.length === 0) {
    listaContainer.innerHTML = '<p>Sem medicamentos encontrados.</p>'
    return
  }

  listaContainer.innerHTML = ''
  meds.forEach(med => {
    const card = document.createElement('div')
    card.style.border = '1px solid #ccc'
    card.style.padding = '10px'
    card.style.marginBottom = '10px'

    card.innerHTML = `
      <strong>${med.name}</strong><br>
      Dosagem: ${med.dosage}<br>
      Frequência: ${med.frequency}<br>
      Período: ${med.start_date} a ${med.end_date}<br>
    `

    const btnEditar = document.createElement('button')
    btnEditar.textContent = '✏️ Editar'
    btnEditar.style.marginRight = '10px'
    btnEditar.addEventListener('click', () => preencherFormulario(med))

    const btnApagar = document.createElement('button')
    btnApagar.textContent = '🗑️ Apagar'
    btnApagar.addEventListener('click', async () => {
      const confirmar = confirm(`⚠️ Isto irá remover o medicamento e todas as prescrições e confirmações associadas. Continuar?`)
      if (!confirmar) return

      await supabase.from('confirmations').delete().eq('medication_id', med.id)
      await supabase.from('prescriptions').delete().eq('medication_id', med.id)

      const { error } = await supabase.from('medications').delete().eq('id', med.id)
      if (error) {
        alert('Erro ao apagar: ' + error.message)
      } else {
        alert('✅ Medicamento apagado com sucesso.')
        carregarMedicamentosDoAdmin()
      }
    })

    card.appendChild(btnEditar)
    card.appendChild(btnApagar)
    listaContainer.appendChild(card)
  })
}

// === ASSOCIAR PACIENTE AO ADMIN ===
if (associarBtn) {
  associarBtn.addEventListener('click', async () => {
    const pacienteId = pacienteIdInput.value.trim()
    const adminId = await getAdminId()

    associarStatus.textContent = ''
    if (!pacienteId || !adminId) {
      associarStatus.textContent = 'Erro: código inválido ou sessão expirada.'
      return
    }

    const { data: paciente, error: fetchError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', pacienteId)
      .single()

    if (fetchError || !paciente || paciente.role !== 'patient') {
      associarStatus.textContent = 'Erro: paciente não encontrado ou não é válido.'
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ admin_code: adminId })
      .eq('user_id', pacienteId)

    if (updateError) {
      associarStatus.textContent = 'Erro ao associar: ' + updateError.message
      return
    }

    associarStatus.textContent = '✅ Paciente associado com sucesso!'
    pacienteIdInput.value = ''
    await loadPacientesAssociados()
  })
}

// === LISTAR PACIENTES ASSOCIADOS COM NOTAS ===
async function loadPacientesAssociados() {
  const adminId = await getAdminId()
  if (!adminId) {
    pacientesContainer.innerHTML = '<p>Não autenticado.</p>'
    return
  }

  const { data: pacientes, error } = await supabase
    .from('profiles')
    .select('user_id, admin_note')
    .eq('admin_code', adminId)

  if (error || !pacientes || pacientes.length === 0) {
    pacientesContainer.innerHTML = '<p>Nenhum paciente associado.</p>'
    return
  }

  pacientesContainer.innerHTML = ''
  for (const paciente of pacientes) {
    const card = document.createElement('div')
    card.style.border = '1px solid #ccc'
    card.style.marginBottom = '10px'
    card.style.padding = '10px'

    card.innerHTML = `
      <strong>Paciente ID:</strong> ${paciente.user_id}<br>
      <label>Nota do cuidador:</label>
      <input type="text" value="${paciente.admin_note || ''}" id="nota-${paciente.user_id}" style="width: 90%; margin-top: 5px;" />
      <button data-id="${paciente.user_id}" class="btn-save-note" style="margin-top: 5px;">💾 Guardar Nota</button><br>
      <a href="admin-paciente.html?paciente_id=${paciente.user_id}">Ver detalhes</a>
    `

    pacientesContainer.appendChild(card)
  }

  const botoesGuardar = document.querySelectorAll('.btn-save-note')
  botoesGuardar.forEach(btn => {
    btn.addEventListener('click', async () => {
      const pacienteId = btn.dataset.id
      const nota = document.getElementById(`nota-${pacienteId}`).value

      const { error } = await supabase
        .from('profiles')
        .update({ admin_note: nota })
        .eq('user_id', pacienteId)

      if (error) {
        alert('Erro ao guardar nota: ' + error.message)
      } else {
        alert('✅ Nota guardada!')
      }
    })
  })
}

// === INICIALIZAÇÕES ===
carregarMedicamentosDoAdmin()
loadPacientesAssociados()
