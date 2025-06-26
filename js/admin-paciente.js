// js/admin-paciente.js

import { supabase } from './supabaseClient.js'

const container = document.getElementById('prescricao-container')
const historicoContainer = document.getElementById('historico-container')
const pacienteId = new URLSearchParams(window.location.search).get('paciente_id')

async function getAdminId() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id || null
}

async function carregarMedicamentosParaPrescrever() {
  const adminId = await getAdminId()
  if (!adminId || !pacienteId) {
    container.innerHTML = '<div class="alert alert-danger">Erro ao obter dados do utilizador.</div>'
    return
  }

  const { data: meds, error: medError } = await supabase
    .from('medications')
    .select('*')
    .eq('admin_id', adminId)

  if (medError || !meds || meds.length === 0) {
    container.innerHTML = '<div class="alert alert-warning">Nenhum medicamento encontrado.</div>'
    return
  }

  const { data: prescricoes, error: prescError } = await supabase
    .from('prescriptions')
    .select('medication_id')
    .eq('patient_id', pacienteId)

  if (prescError) {
    container.innerHTML = '<div class="alert alert-danger">Erro ao buscar prescrições existentes.</div>'
    return
  }

  const medicamentosPrescritos = new Set(prescricoes.map(p => p.medication_id))

  container.innerHTML = ''
  meds.forEach(med => {
    const div = document.createElement('div')
    div.className = 'card mb-3 p-3 shadow-sm'

    div.innerHTML = `
      <strong>${med.name}</strong><br>
      Dosagem: ${med.dosage}<br>
      Frequência: ${med.frequency}<br>
    `

    const btn = document.createElement('button')

    if (medicamentosPrescritos.has(med.id)) {
      btn.textContent = '🗑️ Remover Prescrição 🗑️'
      btn.className = 'btn btn-outline-danger mt-2'
      btn.addEventListener('click', async () => {
        const confirmar = confirm(`Remover prescrição de ${med.name}?`)
        if (!confirmar) return

        const { error: deleteError } = await supabase
          .from('prescriptions')
          .delete()
          .eq('patient_id', pacienteId)
          .eq('medication_id', med.id)

        if (deleteError) {
          alert('Erro ao remover: ' + deleteError.message)
        } else {
          alert('✅ Prescrição removida!')
          carregarMedicamentosParaPrescrever()
          carregarHistoricoConfirmacoes()
        }
      })
    } else {
      btn.textContent = '➕ Prescrever'
      btn.className = 'btn btn-success mt-2'
      btn.addEventListener('click', async () => {
        const { error: insertError } = await supabase
          .from('prescriptions')
          .insert([{ patient_id: pacienteId, medication_id: med.id, admin_id: adminId }])

        if (insertError) {
          alert('Erro ao prescrever: ' + insertError.message)
        } else {
          alert('✅ Prescrição realizada!')
          carregarMedicamentosParaPrescrever()
          carregarHistoricoConfirmacoes()
        }
      })
    }

    div.appendChild(btn)
    container.appendChild(div)
  })
}

async function carregarHistoricoConfirmacoes() {
  historicoContainer.innerHTML = '<p class="text-muted">A carregar histórico...</p>'

  const { data, error } = await supabase
    .from('confirmations')
    .select('confirmed_at, prescriptions(id, medications(name))')
    .eq('patient_id', pacienteId)
    .order('confirmed_at', { ascending: false })

  if (error || !data || data.length === 0) {
    historicoContainer.innerHTML = '<p class="text-muted">Nenhuma confirmação encontrada.</p>'
    return
  }

  const lista = document.createElement('ul')
  lista.className = 'list-group'

  data.forEach(item => {
    const medicamento = item.prescriptions?.medications?.name || 'Desconhecido'
    const dataFormatada = new Date(item.confirmed_at).toLocaleString('pt-PT')
    const li = document.createElement('li')
    li.className = 'list-group-item'
    li.textContent = `✅ ${medicamento} - ${dataFormatada}`
    lista.appendChild(li)
  })

  historicoContainer.innerHTML = ''
  historicoContainer.appendChild(lista)
}

// Inicialização
carregarMedicamentosParaPrescrever()
carregarHistoricoConfirmacoes()
