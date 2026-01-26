<p align="center">
  <img src="https://img.shields.io/badge/.NET-10.0-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" alt=".NET 10"/>
  <img src="https://img.shields.io/badge/ASP.NET_Core-Web_API-512BD4?style=for-the-badge&logo=dotnet&logoColor=white" alt="ASP.NET Core"/>
  <img src="https://img.shields.io/badge/Amadeus-API-1B69FE?style=for-the-badge&logo=amadeus&logoColor=white" alt="Amadeus API"/>
  <img src="https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap 5"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License MIT"/>
</p>

<h1 align="center">✈️ FlightSearchEngine</h1>

<p align="center">
  <strong>Un moteur de recherche de vols moderne et performant propulsé par l'API Amadeus</strong>
</p>

<p align="center">
  <em>Recherchez, filtrez et comparez des milliers de vols en temps réel avec une interface utilisateur élégante et responsive.</em>
</p>

---

## 📋 Table des Matières

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Technologies Utilisées](#-technologies-utilisées)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [API Endpoints](#-api-endpoints)
- [Structure du Projet](#-structure-du-projet)
- [Contribuer](#-contribuer)
- [Licence](#-licence)

---

## 🎯 Aperçu

**FlightSearchEngine** est une application web full-stack qui permet aux utilisateurs de rechercher des vols en temps réel via l'API Amadeus. L'application offre une expérience utilisateur fluide avec une interface moderne, des filtres avancés et un système de tri intelligent.

### Captures d'écran

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Formulaire de recherche avec autocomplétion             │
│  📅 Sélection de dates intelligente                         │
│  👥 Gestion des passagers (adultes, enfants, bébés)         │
│  🎫 Choix de la classe de voyage                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  📊 Résultats avec filtres dynamiques                       │
│  💰 Tri par prix, durée, heure de départ                    │
│  🛫 Affichage détaillé des segments de vol                  │
│  📱 Design responsive (mobile/tablette/desktop)             │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Fonctionnalités

### 🔍 Recherche de Vols
- **Autocomplétion intelligente** des aéroports et villes
- Support des vols **aller simple** et **aller-retour**
- Recherche par **dates flexibles**
- Gestion complète des **passagers** (adultes, enfants, bébés)
- Sélection de la **classe de voyage** (Économique, Premium, Affaires, Première)

### 🎛️ Filtres Avancés
- **Compagnies aériennes** - Filtrer par opérateur
- **Type de vol** - Direct ou avec escales
- **Nombre d'escales** - Limiter les correspondances
- **Heures de départ** - Nuit, matin, après-midi, soirée
- **Heures d'arrivée** - Plages horaires personnalisables
- **Plage de prix** - Slider interactif min/max

### 📊 Tri Intelligent
| Option | Description |
|--------|-------------|
| `price` | Prix croissant |
| `price_desc` | Prix décroissant |
| `duration` | Durée croissante |
| `duration_desc` | Durée décroissante |
| `departure` | Heure de départ croissante |
| `departure_desc` | Heure de départ décroissante |

### 🎨 Interface Utilisateur
- Design **moderne et responsive** avec Bootstrap 5
- **Thème élégant** avec animations fluides
- **Pagination** intelligente des résultats
- Affichage des **logos des compagnies aériennes**
- **Messages d'erreur** clairs et informatifs

### ⚡ Performance
- **Mise en cache** des tokens d'authentification Amadeus
- **Mise en cache** des résultats de recherche d'aéroports
- **Debouncing** sur l'autocomplétion (optimisation réseau)
- **Chargement asynchrone** des résultats

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Frontend)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  index.html │  │   app.js    │  │  style.css  │              │
│  │  (Bootstrap)│  │  (Vanilla)  │  │  (Custom)   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API (ASP.NET Core 10)                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    FlightsController                      │   │
│  │  • GET /api/flights/search    - Recherche de vols        │   │
│  │  • GET /api/flights/airports  - Recherche d'aéroports    │   │
│  │  • GET /api/flights/classes   - Classes de voyage        │   │
│  │  • GET /api/flights/sort-options - Options de tri        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Services Layer                         │   │
│  │  ┌─────────────────────┐  ┌─────────────────────────┐    │   │
│  │  │ IFlightSearchService│  │  AmadeusFlightService   │    │   │
│  │  │    (Interface)      │◄─│   (Implementation)      │    │   │
│  │  └─────────────────────┘  └─────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     Models Layer                          │   │
│  │  Flight │ FlightSegment │ Airport │ FlightSearchRequest  │   │
│  │  FlightSearchResult │ AmadeusResponses (DTOs)            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        AMADEUS API                               │
│  • OAuth 2.0 Authentication                                     │
│  • Flight Offers Search API (v2)                                │
│  • Airport & City Search API (v1)                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technologies Utilisées

### Backend
| Technologie | Version | Description |
|-------------|---------|-------------|
| **.NET** | 10.0 | Framework de développement |
| **ASP.NET Core** | 10.0 | Framework web API |
| **Newtonsoft.Json** | 13.0.4 | Sérialisation JSON |
| **Swashbuckle** | 10.1.0 | Documentation Swagger/OpenAPI |
| **Memory Cache** | Intégré | Mise en cache en mémoire |

### Frontend
| Technologie | Version | Description |
|-------------|---------|-------------|
| **Bootstrap** | 5.3.2 | Framework CSS responsive |
| **Bootstrap Icons** | 1.11.1 | Bibliothèque d'icônes |
| **Google Fonts** | Nunito Sans | Typographie moderne |
| **Vanilla JavaScript** | ES6+ | Logique client |

### API Externe
| Service | Description |
|---------|-------------|
| **Amadeus for Developers** | API de recherche de vols et d'aéroports |

---

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- [.NET SDK 10.0](https://dotnet.microsoft.com/download/dotnet/10.0) ou supérieur
- Un compte [Amadeus for Developers](https://developers.amadeus.com/) (gratuit)
- [Git](https://git-scm.com/) pour cloner le repository

### Vérification de l'installation

```bash
# Vérifier la version de .NET
dotnet --version
# Résultat attendu: 10.0.x
```

---

## 🚀 Installation

### 1. Cloner le Repository

```bash
git clone https://github.com/SaadBarhrouj/FlightSearchEngine.git
cd FlightSearchEngine
```

### 2. Restaurer les Dépendances

```bash
cd src/FlightSearchEngine/FlightSearchEngine
dotnet restore
```

### 3. Configurer les Clés API

Créez ou modifiez le fichier `appsettings.json` :

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "Amadeus": {
    "ApiKey": "VOTRE_API_KEY",
    "ApiSecret": "VOTRE_API_SECRET",
    "BaseUrl": "https://test.api.amadeus.com"
  }
}
```

> ⚠️ **Important** : N'ajoutez jamais vos clés API dans le contrôle de version. Utilisez des variables d'environnement ou le `appsettings.Development.json` (ignoré par Git).

### 4. Lancer l'Application

```bash
dotnet run
```

L'application sera accessible à :
- **HTTP** : `http://localhost:5000`
- **HTTPS** : `https://localhost:5001`
- **Swagger UI** : `https://localhost:5001/swagger` (en développement)

---

## ⚙️ Configuration

### Variables d'Environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `Amadeus__ApiKey` | Clé API Amadeus | `abc123...` |
| `Amadeus__ApiSecret` | Secret API Amadeus | `xyz789...` |
| `Amadeus__BaseUrl` | URL de base de l'API | `https://test.api.amadeus.com` |

### Environnements

| Environnement | URL API Amadeus | Description |
|---------------|-----------------|-------------|
| **Test** | `https://test.api.amadeus.com` | Données de test, gratuit |
| **Production** | `https://api.amadeus.com` | Données réelles, payant |

### Configuration CORS

L'application est configurée pour accepter toutes les origines en développement. Pour la production, modifiez `Program.cs` :

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("Production", policy =>
    {
        policy.WithOrigins("https://votre-domaine.com")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
```

---

## 📖 Utilisation

### Recherche de Base

1. **Entrez une ville de départ** - L'autocomplétion vous suggère des aéroports
2. **Entrez une ville d'arrivée** - Sélectionnez parmi les suggestions
3. **Choisissez vos dates** - Départ et retour (optionnel)
4. **Sélectionnez les passagers** - Adultes, enfants, bébés
5. **Cliquez sur "Rechercher"** - Les résultats s'affichent instantanément

### Filtrage des Résultats

Une fois les résultats affichés, utilisez le panneau de filtres à gauche :

```
🏢 Compagnies aériennes  → Cochez les compagnies souhaitées
✈️ Type de vol           → Direct ou avec escales
🗺️ Nombre d'escales     → 0, 1, 2, etc.
🌅 Heures de départ      → Par période (matin, après-midi...)
🌆 Heures d'arrivée      → Par période
💰 Plage de prix         → Glissez les curseurs
```

### Tri des Résultats

Utilisez les options de tri en haut des résultats pour organiser les vols par :
- Prix (croissant/décroissant)
- Durée (croissante/décroissante)
- Heure de départ (croissante/décroissante)

---

## 🔌 API Endpoints

### Recherche de Vols

```http
GET /api/flights/search
```

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `origin` | string | ✅ | Code IATA de départ (ex: CDG) |
| `destination` | string | ✅ | Code IATA d'arrivée (ex: JFK) |
| `departureDate` | date | ✅ | Date de départ (YYYY-MM-DD) |
| `returnDate` | date | ❌ | Date de retour |
| `adults` | int | ❌ | Nombre d'adultes (défaut: 1) |
| `children` | int | ❌ | Nombre d'enfants (défaut: 0) |
| `infants` | int | ❌ | Nombre de bébés (défaut: 0) |
| `travelClass` | string | ❌ | Classe (ECONOMY, BUSINESS...) |
| `sortBy` | string | ❌ | Critère de tri |
| `directOnly` | bool | ❌ | Vols directs uniquement |
| `maxStops` | int | ❌ | Nombre max d'escales |

**Exemple de Requête :**

```bash
curl "http://localhost:5000/api/flights/search?origin=CDG&destination=JFK&departureDate=2026-03-15&adults=2&travelClass=ECONOMY"
```

**Exemple de Réponse :**

```json
{
  "success": true,
  "flights": [
    {
      "id": "1",
      "totalPrice": 450.50,
      "currency": "EUR",
      "totalDuration": "PT8H30M",
      "numberOfStops": 0,
      "isDirect": true,
      "outboundSegments": [
        {
          "departureAirportCode": "CDG",
          "arrivalAirportCode": "JFK",
          "carrierCode": "AF",
          "carrierName": "Air France",
          "flightNumber": "006"
        }
      ]
    }
  ],
  "totalResults": 15,
  "searchTimestamp": "2026-01-26T20:30:00Z"
}
```

### Recherche d'Aéroports

```http
GET /api/flights/airports?keyword=paris
```

**Réponse :**

```json
[
  {
    "iataCode": "CDG",
    "name": "Charles de Gaulle Airport",
    "cityName": "Paris",
    "countryName": "France",
    "displayName": "Paris - Charles de Gaulle Airport (CDG)"
  },
  {
    "iataCode": "ORY",
    "name": "Orly Airport",
    "cityName": "Paris",
    "countryName": "France",
    "displayName": "Paris - Orly Airport (ORY)"
  }
]
```

### Classes de Voyage

```http
GET /api/flights/classes
```

**Réponse :**

```json
[
  { "code": "ECONOMY", "name": "Économique" },
  { "code": "PREMIUM_ECONOMY", "name": "Économique Premium" },
  { "code": "BUSINESS", "name": "Affaires" },
  { "code": "FIRST", "name": "Première" }
]
```

### Options de Tri

```http
GET /api/flights/sort-options
```

**Réponse :**

```json
[
  { "code": "price", "name": "Prix croissant" },
  { "code": "price_desc", "name": "Prix décroissant" },
  { "code": "duration", "name": "Durée croissante" },
  { "code": "duration_desc", "name": "Durée décroissante" },
  { "code": "departure", "name": "Heure de départ croissante" },
  { "code": "departure_desc", "name": "Heure de départ décroissante" }
]
```

---

## 📁 Structure du Projet

```
FlightSearchEngine/
├── 📄 README.md                          # Documentation du projet
├── 📄 .gitignore                         # Fichiers ignorés par Git
│
└── 📂 src/
    └── 📂 FlightSearchEngine/
        ├── 📄 FlightSearchEngine.slnx    # Solution Visual Studio
        │
        └── 📂 FlightSearchEngine/        # Projet principal
            │
            ├── 📄 Program.cs             # Point d'entrée de l'application
            ├── 📄 FlightSearchEngine.csproj
            ├── 📄 appsettings.json       # Configuration (production)
            ├── 📄 appsettings.Development.json
            │
            ├── 📂 Controllers/
            │   └── 📄 FlightsController.cs   # API REST endpoints
            │
            ├── 📂 Services/
            │   ├── 📄 IFlightSearchService.cs    # Interface du service
            │   └── 📄 AmadeusFlightService.cs    # Implémentation Amadeus
            │
            ├── 📂 Models/
            │   ├── 📄 Flight.cs              # Modèle de vol
            │   ├── 📄 FlightSegment.cs       # Segment de vol
            │   ├── 📄 FlightSearchRequest.cs # Requête de recherche
            │   ├── 📄 FlightSearchResult.cs  # Résultat de recherche
            │   ├── 📄 Airport.cs             # Modèle d'aéroport
            │   └── 📄 AmadeusResponses.cs    # DTOs API Amadeus
            │
            ├── 📂 Properties/
            │   └── 📄 launchSettings.json
            │
            └── 📂 wwwroot/               # Fichiers statiques
                ├── 📄 index.html         # Page principale
                │
                ├── 📂 css/
                │   ├── 📄 style.css      # Styles principaux
                │   ├── 📄 filters.css    # Styles des filtres
                │   └── 📄 sort-styles.css # Styles du tri
                │
                └── 📂 js/
                    ├── 📄 app.js         # Application principale
                    ├── 📄 filters.js     # Logique des filtres
                    └── 📄 sort.js        # Logique du tri
```

---

## 🧪 Tests

### Exécuter les Tests

```bash
dotnet test
```

### Tester l'API Manuellement

Utilisez l'interface Swagger disponible en mode développement :

```
https://localhost:5001/swagger
```

Ou utilisez des outils comme **Postman** ou **curl** pour tester les endpoints.

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Voici comment procéder :

1. **Fork** le repository
2. **Créez** une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. **Commitez** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Pushez** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrez** une Pull Request

### Guidelines

- Suivez les conventions de code C# et JavaScript
- Ajoutez des tests pour les nouvelles fonctionnalités
- Mettez à jour la documentation si nécessaire
- Assurez-vous que le build passe avant de soumettre

---

## 📝 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👨‍💻 Auteur

**Saad Barhrouj**

- GitHub: [@SaadBarhrouj](https://github.com/SaadBarhrouj)

---

## 🙏 Remerciements

- [Amadeus for Developers](https://developers.amadeus.com/) pour l'API de vols
- [Bootstrap](https://getbootstrap.com/) pour le framework CSS
- [Kiwi.com](https://kiwi.com/) pour les logos des compagnies aériennes

---

<p align="center">
  <strong>⭐ Si ce projet vous a été utile, n'hésitez pas à lui donner une étoile !</strong>
</p>

<p align="center">
  Made with ❤️ and ☕
</p>