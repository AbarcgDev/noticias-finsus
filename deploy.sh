#!/bin/bash
# NO EJECUTAR MANUALMENTE, SE ENVIA AL SERVICIO DE DESPLIEGUE EN DOCKER
# Salir inmediatamente si un comando falla
set -e

echo "Instalando dependencias..."
npm install

echo "Desplegando Worker..."
npx wrangler deploy