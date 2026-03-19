<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
</script>

<template>
  <div class="min-h-svh flex flex-col items-center justify-center p-6 bg-[#0a0a0f]">
    <!-- Background glow -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/3 left-1/4 w-72 h-72 bg-[#7c6dfa] opacity-[0.04] blur-3xl rounded-full" />
      <div class="absolute bottom-1/3 right-1/4 w-72 h-72 bg-[#c4b5fd] opacity-[0.03] blur-3xl rounded-full" />
    </div>

    <div class="relative w-full max-w-sm flex flex-col items-center">
      <!-- Logo mark -->
      <div class="mb-6">
        <div class="w-16 h-16 rounded-2xl bg-[#7c6dfa]/10 border border-[#7c6dfa]/20 flex items-center justify-center
                    shadow-lg shadow-[#7c6dfa]/10">
          <svg class="w-8 h-8 text-[#7c6dfa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"/>
          </svg>
        </div>
      </div>

      <!-- Title -->
      <div class="text-center mb-10">
        <h1 class="text-3xl font-bold text-[#f0f0f5] tracking-tight">TaskFlow</h1>
        <p class="text-sm text-[#55556a] mt-1.5 font-medium">Gerenciamento de tarefas</p>
      </div>

      <!-- Action buttons -->
      <div class="w-full space-y-3">
        <button
          class="w-full group relative overflow-hidden bg-[#7c6dfa] hover:bg-[#9d8ffc] active:bg-[#6a5ce8]
                 text-white font-semibold text-base rounded-2xl py-4 px-6
                 flex items-center justify-between
                 transition-all duration-200 shadow-lg shadow-[#7c6dfa]/20 hover:shadow-[#7c6dfa]/30"
          @click="router.push('/task/new')"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
              </svg>
            </div>
            <span>Nova Tarefa</span>
          </div>
          <svg class="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
          </svg>
        </button>

        <button
          class="w-full group relative bg-[#111118] hover:bg-[#1a1a24] active:bg-[#0d0d14]
                 text-[#f0f0f5] font-semibold text-base rounded-2xl py-4 px-6
                 flex items-center justify-between
                 border border-[#2a2a3a] hover:border-[#3a3a50]
                 transition-all duration-200"
          @click="router.push('/board')"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-[#1a1a24] border border-[#2a2a3a] flex items-center justify-center">
              <svg class="w-4 h-4 text-[#8888aa]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
              </svg>
            </div>
            <span>Ver Tarefas</span>
          </div>
          <svg class="w-4 h-4 opacity-40 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
          </svg>
        </button>
      </div>

      <!-- Sign out -->
      <button
        class="mt-8 text-xs text-[#55556a] hover:text-[#8888aa] transition-colors"
        @click="auth.signOut()"
      >
        Sair da conta
      </button>
    </div>
  </div>
</template>
