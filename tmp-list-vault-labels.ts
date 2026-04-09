import { vault } from './skills/credential-vault/lib/encryption.ts'

async function main() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase env')

  vault.initializeSupabase(url, key)
  const result = await vault.unlock(process.env.VAULT_PIN || '2846')
  if (!result.success) throw new Error(result.message || 'Unlock failed')

  const providers = await vault.listProviders()
  console.log('PROVIDERS')
  for (const provider of providers) {
    if (/discord|iris|redfox/i.test(provider)) console.log(provider)
  }

  for (const provider of providers) {
    if (!/discord|iris|redfox/i.test(provider)) continue
    const accounts = await vault.listAccounts(provider)
    console.log(`\nACCOUNTS for ${provider}`)
    for (const account of accounts) {
      console.log(`- ${account}`)
      const fields = await vault.listFields(provider, account)
      console.log(`  fields: ${fields.join(', ')}`)
    }
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
