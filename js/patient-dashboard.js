import { supabase } from './supabaseClient.js'
import { pedirPermissaoNotificacoes, mostrarNotificacao } from './notifications.js'

const medicamentosContainer = document.getElementById('medicamentos-container')
const historicoContainer = document.getElementById('historico-container')

let userId = null

// === Permissão e Notificação diária ===
document.addEventListener('DOMContentLoaded', async () => {
  const permitido = await pedirPermissaoNotificacoes()

  if (permitido) {
    mostrarNotificacao('Bem-vindo!', {
      body: 'Confirma os teus medicamentos de hoje.',
      icon: 'icons/icon-192x192.png'
    })

    agendarNotificacaoDiaria(9, 0) // Agendar para 9h00 da manhã
  }

  userId = await getUserId()
  if (userId) {
    carregarMedicamentosPrescritos()
    carregarHistoricoConfirmacoes()
  }
})

// === Agendar notificação para hora fixa ===
function agendarNotificacaoDiaria(hora = 9, minuto = 0) {
  const agora = new Date()
  const proxima = new Date()
  proxima.setHours(hora, minuto, 0, 0)

  if (proxima <= agora) {
    proxima.setDate(proxima.getDate() + 1)
  }

  const delay = proxima - agora

  setTimeout(() => {
    mostrarNotificacao('Hora da medicação 💊', {
      body: 'Confirma os medicamentos de hoje!',
      icon: 'icons/icon-192x192.png'
    })

    // Repetir todos os dias
    setInterval(() => {
      mostrarNotificacao('Hora da medicação 💊', {
        body: 'Confirma os medicamentos de hoje!',
        icon: 'icons/icon-192x192.png'
      })
    }, 24 * 60 * 60 * 1000)
  }, delay)
}

// === Utilitário ===
async function getUserId() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id || null
}

// === Carregar medicamentos ativos ===
async function carregarMedicamentosPrescritos() {
  if (!medicamentosContainer) return
  medicamentosContainer.innerHTML = ''

  const { data: prescricoes, error } = await supabase
    .from('prescriptions')
    .select('id, medication:medications(name, dosage, frequency, start_date, end_date)')
    .eq('patient_id', userId)

  if (error || !prescricoes || prescricoes.length === 0) {
    medicamentosContainer.innerHTML = '<p>Nenhum medicamento ativo encontrado.</p>'
    return
  }

  prescricoes.forEach(p => {
    const med = p.medication
    const card = document.createElement('div')
    card.classList.add('mb-3', 'p-3', 'border', 'rounded')

    const btn = document.createElement('button')
    btn.classList.add('btn', 'btn-success', 'mt-2')
    btn.innerText = 'Confirmar'
    btn.addEventListener('click', () => confirmarMedicamento(p.id))

    card.innerHTML = `
      <strong>${med.name}</strong><br>
      Dosagem: ${med.dosage}<br>
      Frequência: ${med.frequency}<br>
      Período: ${med.start_date} a ${med.end_date}<br>
    `
    card.appendChild(btn)
    medicamentosContainer.appendChild(card)
  })
}

// === Confirmar toma de medicamento ===
async function confirmarMedicamento(prescriptionId) {
  const { error } = await supabase.from('confirmations').insert([
    {
      patient_id: userId,
      prescription_id: prescriptionId,
      confirmed_at: new Date().toISOString()
    }
  ])

  if (!error) {
    alert('✅ Toma confirmada com sucesso!')
    carregarHistoricoConfirmacoes()
  } else {
    alert('Erro ao confirmar: ' + error.message)
  }
}

// === Histórico de confirmações ===
async function carregarHistoricoConfirmacoes() {
  if (!historicoContainer) return
  historicoContainer.innerHTML = ''

  const { data, error } = await supabase
    .from('confirmations')
    .select('confirmed_at, prescription_id, prescriptions(id, medications(name))')
    .eq('patient_id', userId)
    .order('confirmed_at', { ascending: false })

  if (error || !data || data.length === 0) {
    historicoContainer.innerHTML = '<p>Nenhuma confirmação ainda.</p>'
    return
  }

  const lista = document.createElement('ul')
  lista.classList.add('list-group')

  data.forEach(item => {
    const li = document.createElement('li')
    li.classList.add('list-group-item')
    li.innerText = `✅ ${item.prescriptions.medications.name} - ${new Date(item.confirmed_at).toLocaleString()}`
    lista.appendChild(li)
  })

  historicoContainer.appendChild(lista)
}
