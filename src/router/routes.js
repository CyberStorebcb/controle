const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'menu',
        component: () => import('pages/IndexPage.vue'),
      },
      {
        path: 'obras',
        name: 'obras',
        component: () => import('pages/ObrasPage.vue'),
      },
      {
        path: 'mesa-pendencias',
        name: 'mesa-pendencias',
        component: () => import('pages/MesaPendenciasPage.vue'),
      },
      {
        path: 'adicionar-fotos',
        name: 'adicionar-fotos',
        component: () => import('pages/AdicionarFotosPage.vue'),
      },
      {
        path: 'croqui',
        name: 'croqui',
        component: () => import('pages/CroquiPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
