// El navegador llama a /api/... en el mismo origen y ng serve lo reenvía al back sin el prefijo.
module.exports = {
  '/api': {
    target: process.env.API_TARGET || 'http://localhost:8001',
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
  },
};
