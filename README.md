# Solar_Cam 🌞📷

Projet personnel de domotique visant à centraliser et visualiser des données issues de panneaux solaires (SMA), de machines à laver connectées (Miele), de caméras de surveillance (EZVIZ), accessibles depuis une interface web sécurisée via Tailscale.

---

## Aperçu

### Dashboard
![Dashboard](images/dashboard.png)

### Planning machine (Schedule)
![Schedule](images/schedule_full.png)

### Contrôle Miele
![Miele](images/schedule_machine.png)

### Tableaux de données
![Tableaux](images/tableaux.png)

### Caméras
![Caméras](images/cams.png)

---

## Fonctionnalités

- **Production solaire** : collecte toutes les minutes via l'API SMA (puissance instantanée, production totale), stockage PostgreSQL
- **Météo** : prévisions horaires (température, rayonnement solaire) via [Open-Meteo](https://open-meteo.com/), fuseau horaire Europe/Brussels
- **Graphiques interactifs** : charts Recharts avec slider de fenêtre temporelle centrable sur une heure précise, tooltip au survol, adapté mobile
- **Caméras EZVIZ** : flux vidéo en temps réel via go2rtc (RTSP → WebRTC/WebSocket proxifié par Nginx)
- **Machine à laver Miele** : connexion OAuth2, visualisation de l'état (programme, temps restant/avant lancement), sélection de programme, lancement différé avec stepper H/min, mise en pause avec confirmation
- **Historique lavages** : tableau des derniers programmes (date, type, auteur, statut)
- **Authentification JWT** : token 7 jours, vérification d'expiration automatique côté frontend, bcrypt
- **Menu de navigation** : hamburger fixe en haut à droite, présent sur toutes les pages
- **Notifications push** : infrastructure web-push en place

---

## Pages

| Page | Description |
|------|-------------|
| `/dashboard` | Vue d'ensemble avec graphique météo journalier et accès rapide aux pages |
| `/schedule` | Historique lavages, connexion Miele, sélection machine/programme, graphiques solaires |
| `/table` | Graphiques détaillés avec sliders : météo, rayonnement, production électrique |
| `/cams` | Flux vidéo garage et sonnette, bouton d'ouverture de porte avec confirmation |

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React + React Router + Recharts |
| Backend | Node.js + Fastify |
| ORM | Prisma v6 |
| Base de données | PostgreSQL (Timestamptz) |
| Reverse proxy | Nginx (SSL, WebSocket) |
| VPN / accès distant | Tailscale |
| Flux vidéo | go2rtc (RTSP → WebRTC/WS) |
| Conteneurisation | Docker + Docker Compose |

---

## Architecture

```
                    ┌─────────────┐
                    │  Tailscale  │  (VPN – accès distant sécurisé)
                    └──────┬──────┘
                           │ HTTPS 443
                    ┌──────▼──────┐
                    │    Nginx    │  (reverse proxy SSL)
                    └──────┬──────┘
          ┌────────────────┼──────────────────┐
   ┌──────▼──────┐  ┌──────▼──────┐  ┌────────▼────────┐
   │   Frontend  │  │   Backend   │  │    go2rtc        │
   │  (React)    │  │  (Fastify)  │  │  (RTSP→WebRTC)   │
   └─────────────┘  └──────┬──────┘  └────────┬─────────┘
                    ┌──────▼──────┐            │ RTSP
                    │ PostgreSQL  │     ┌──────▼──────┐
                    └─────────────┘     │  Caméras IP │
                                        │ 192.168.0.x │
                                        └─────────────┘
```

---

## Prérequis

- [Docker](https://www.docker.com/) et Docker Compose
- [Make](https://www.gnu.org/software/make/)
- Compte [Tailscale](https://tailscale.com/) avec auth key
- Compte développeur [Miele](https://developer.miele.com/) (client_id + secret)

---

## Installation

```bash
git clone <url-du-repo>
cd Solar-Cams

make dev    # développement
make        # production
```

### Variables d'environnement

**`gears/backend/.env`** :
```env
DATABASE_URL=postgresql://user_admin:<password>@db:5432/db
JWT_SECRET=<secret>
MIELE_ID=<client_id>
MIELE_SECRET=<secret>
MIELE_REDIRECT_URI=https://<hostname>/api/miele/callback
LAT=<latitude of house>
LONG=<longitude of house>
SMA_ID=<id_onduleur>
EZVIZ_KEY=<clé>
EZVIZ_SECRET=<secret>
PUSH_PUBLIC_KEY=<clé>
PUSH_PRIVATE_KEY=<clé>
```

**`gears/go2rtc/.env`** :
```env
GARAGE_IP=192.168.0.xxx
GARAGE_CODE=<mdp_rtsp>
SONETTE_IP=192.168.0.xxx
SONETTE_CODE=<mdp_rtsp>
PORT=554
USER=admin
```

**`gears/tailscale/.env`** :
```env
TS_AUTHKEY=<auth_key>
```

---

## Commandes Makefile

| Commande | Description |
|----------|-------------|
| `make` | Build et démarrage (prod) |
| `make dev` | Build et démarrage (dev) |
| `make clean` | Arrêt + suppression images |
| `make re` | Rebuild complet |
| `make stop` | Arrêt des conteneurs |

---

## Notes techniques

**Timezone** — données météo en `Timestamptz`, affichage en `Europe/Brussels`. API Open-Meteo appelée avec `timezone=UTC`.

**Caméras** — go2rtc en `network_mode: "service:tailscale"`. En cas de changement d'IP DHCP, mettre à jour `GARAGE_IP` dans `gears/go2rtc/.env`. Faire une réservation DHCP dans le routeur pour fixer les IPs.

**Miele OAuth2** — `MIELE_REDIRECT_URI` doit être enregistrée dans le [Miele Developer Portal](https://developer.miele.com/).

---

## Auteur

**Gfinet** – projet personnel de domotique maison
