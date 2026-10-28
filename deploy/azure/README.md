# Despliegue en Azure VM Ubuntu

## 1) Crear VM
- Ubuntu 24.04 LTS
- Abrir puertos 22, 80, 443 (y opcional 8080 si pruebas directo)
- DNS o IP pública

## 2) Clonar repo
```bash
sudo apt update && sudo apt install -y git
git clone <repo-url> ~/travelnet
cd ~/travelnet
```

## 3) Configurar .env
Copiar `.env.docker.example` a `.env.docker` y ajustar secretos/URLs.

## 4) Instalar Docker
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

## 5) Desplegar con Docker Compose
```bash
npm run docker:env  # o editar manual
npm run docker:up
```

## 6) Nginx + HTTPS (recomendado)
Usar `deploy/nginx/travelnet.conf` como reverse proxy hacia :8080 (web) y /api hacia api:3000.
Con certbot para Let's Encrypt.

## Notas
- Los videos subidos bajo demanda se guardan localmente en `uploads/` (montado como volumen). Respaldarlos si se mueve la VM.
- En Azure se puede usar Blob Storage + CDN, pero para empezar local está listo.
