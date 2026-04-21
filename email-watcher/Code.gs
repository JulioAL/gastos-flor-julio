// ============================================================
// CONFIGURACIÓN — llenar antes del primer deploy
// ============================================================
var API_URL = 'https://TU_URL_VERCEL/api/bank-emails'  // TODO: reemplazar con URL de Vercel
var API_SECRET = 'TU_SECRET_AQUI'                       // TODO: mismo valor que BANK_EMAIL_SECRET en Vercel
var PROCESSED_LABEL = 'gastos-procesado'

// TODO: confirmar estos remitentes en Gmail (ver "De:" en los correos reales)
var BCP_SENDER = 'notificaciones@notificaciones.viabcp.com'
var SCOTIA_SENDER = 'notificaciones@scotiabank.com.pe'
// ============================================================


function watchBankEmails() {
  var label = getOrCreateLabel(PROCESSED_LABEL)
  processBCPEmails(label)
  processScotiabankEmails(label)
}

// ── BCP ──────────────────────────────────────────────────────

function processBCPEmails(processedLabel) {
  var query = 'from:' + BCP_SENDER + ' -label:' + PROCESSED_LABEL
  var threads = GmailApp.search(query, 0, 20)

  threads.forEach(function(thread) {
    thread.getMessages().forEach(function(message) {
      var parsed = parseBCPEmail(message)
      if (parsed) sendToAPI(parsed)
    })
    thread.addLabel(processedLabel)
  })
}

function parseBCPEmail(message) {
  var body = message.getPlainBody()

  // Solo procesar correos de consumo (ignorar marketing, etc.)
  if (!body.match(/Realizaste un consumo/)) return null

  var amountMatch   = body.match(/Total del consumo[\s\S]{0,60}?S\/\s*([\d,]+\.?\d*)/)
  var cardTypeMatch = body.match(/Tarjeta de (Débito|Crédito)/)
  var cardLast4Match = body.match(/Número de Tarjeta[^\n]*[\s\S]{0,10}?\*+(\d{4})/)
  var merchantMatch = body.match(/Empresa\s+([^\n]+)/)
  var dateMatch     = body.match(/(\d{1,2} de \w+ de \d{4} - \d{1,2}:\d{2} [AP]M)/)
  var opMatch       = body.match(/Número de operación\s+(\d+)/)

  if (!amountMatch || !merchantMatch) return null

  return {
    bank: 'BCP',
    amount: parseFloat(amountMatch[1].replace(',', '')),
    merchant: merchantMatch[1].trim(),
    card_type: cardTypeMatch ? cardTypeMatch[1] : 'Débito',
    card_last4: cardLast4Match ? cardLast4Match[1] : null,
    date: parseBCPDate(dateMatch ? dateMatch[1] : null) || message.getDate().toISOString(),
    operation_number: opMatch ? opMatch[1] : null,
    gmail_message_id: message.getId(),
  }
}

// ── Scotiabank ───────────────────────────────────────────────

function processScotiabankEmails(processedLabel) {
  var query = 'from:' + SCOTIA_SENDER + ' -label:' + PROCESSED_LABEL
  var threads = GmailApp.search(query, 0, 20)

  threads.forEach(function(thread) {
    thread.getMessages().forEach(function(message) {
      var parsed = parseScotiabankEmail(message)
      if (parsed) sendToAPI(parsed)
    })
    thread.addLabel(processedLabel)
  })
}

function parseScotiabankEmail(message) {
  var body = message.getPlainBody()

  // Solo transferencias Plin (el correo tiene "Monto enviado")
  if (!body.match(/Monto enviado/)) return null

  var amountMatch  = body.match(/Monto enviado:\s*S\/\s*([\d,]+\.?\d*)/)
  var destMatch    = body.match(/Destino:\s*([^\n]+)/)
  var accountMatch = body.match(/\*\*\* \*\*\*(\d{4})/)
  var opMatch      = body.match(/Número de operación\s+([\d.]+)/)

  if (!amountMatch) return null

  return {
    bank: 'Scotiabank',
    amount: parseFloat(amountMatch[1].replace(',', '')),
    merchant: destMatch ? destMatch[1].trim() : 'Transferencia Plin',
    card_type: 'Débito',
    card_last4: accountMatch ? accountMatch[1] : null,
    date: message.getDate().toISOString(),
    operation_number: opMatch ? opMatch[1] : null,
    gmail_message_id: message.getId(),
  }
}

// ── Helpers ──────────────────────────────────────────────────

var MESES = {
  'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3,
  'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7,
  'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11,
}

function parseBCPDate(dateStr) {
  if (!dateStr) return null
  var m = dateStr.match(/(\d{1,2}) de (\w+) de (\d{4}) - (\d{1,2}):(\d{2}) ([AP]M)/)
  if (!m) return null
  var hour = parseInt(m[4])
  if (m[6] === 'PM' && hour !== 12) hour += 12
  if (m[6] === 'AM' && hour === 12) hour = 0
  return new Date(parseInt(m[3]), MESES[m[2].toLowerCase()], parseInt(m[1]), hour, parseInt(m[5])).toISOString()
}

function sendToAPI(data) {
  var options = {
    method: 'POST',
    contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + API_SECRET },
    payload: JSON.stringify(data),
    muteHttpExceptions: true,
  }
  var response = UrlFetchApp.fetch(API_URL, options)
  Logger.log('[' + data.bank + '] op=' + data.operation_number + ' → ' + response.getResponseCode() + ' ' + response.getContentText())
}

function getOrCreateLabel(name) {
  return GmailApp.getUserLabelByName(name) || GmailApp.createLabel(name)
}

// Ejecutar manualmente una vez para crear el trigger de tiempo
function createTimeTrigger() {
  ScriptApp.newTrigger('watchBankEmails')
    .timeBased()
    .everyMinutes(5)
    .create()
}
