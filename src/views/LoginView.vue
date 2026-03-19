<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppButton from '@/components/ui/AppButton.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function login() {
  if (!email.value || !password.value) {
    error.value = 'Preencha email e senha.'
    return
  }
  error.value = ''
  loading.value = true
  try {
    await auth.signIn(email.value, password.value)
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (e: any) {
    error.value = 'Credenciais inválidas. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-svh flex items-center justify-center p-4 bg-[#0a0a0f]">
    <!-- Glow background -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#7c6dfa] opacity-5 blur-3xl rounded-full" />
    </div>

    <div class="relative w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#7c6dfa]/10 border border-[#7c6dfa]/20 mb-4">
          <svg class="w-7 h-7 text-[#7c6dfa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-[#f0f0f5] tracking-tight">TaskFlow</h1>
        <p class="text-sm text-[#55556a] mt-1">Acesso privado</p>
      </div>

      <!-- Form -->
      <form
        class="bg-[#111118] border border-[#2a2a3a] rounded-2xl p-6 space-y-4"
        @submit.prevent="login"
      >
        <div>
          <label class="block text-xs font-medium text-[#8888aa] mb-1.5">Email</label>
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            class="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-xl px-4 py-3 text-base
                   text-[#f0f0f5] placeholder-[#55556a] outline-none
                   focus:border-[#7c6dfa] transition-colors"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-[#8888aa] mb-1.5">Senha</label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="w-full bg-[#1a1a24] border border-[#2a2a3a] rounded-xl px-4 py-3 text-base
                   text-[#f0f0f5] placeholder-[#55556a] outline-none
                   focus:border-[#7c6dfa] transition-colors"
            placeholder="••••••••"
          />
        </div>

        <Transition
          enter-active-class="transition duration-200"
          enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
        >
          <p v-if="error" class="text-sm text-[#ef4444] bg-[#ef4444]/5 border border-[#ef4444]/20 rounded-lg px-3 py-2">
            {{ error }}
          </p>
        </Transition>

        <AppButton type="submit" :loading="loading" full size="lg">
          Entrar
        </AppButton>
      </form>
    </div>
  </div>
</template>
