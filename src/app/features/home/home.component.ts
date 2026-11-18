import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Fly Anywhere, Seamlessly</h1>
        <p class="hero-subtitle">Book flights across India and international destinations with instant confirmation</p>
        <a routerLink="/search" mat-raised-button color="accent" class="btn-hero">
          <mat-icon>flight_takeoff</mat-icon>
          <span>Search Flights</span>
        </a>
      </div>
      <div class="hero-decoration">
        <div class="plane-trail"></div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features container">
      <div class="features-grid">
        <mat-card class="feature-card">
          <div class="feature-icon"><mat-icon>currency_rupee</mat-icon></div>
          <h3>Best Fare Guarantee</h3>
          <p>Transparent pricing in INR with zero hidden fees across top airlines.</p>
        </mat-card>

        <mat-card class="feature-card">
          <div class="feature-icon"><mat-icon>airline_seat_recline_extra</mat-icon></div>
          <h3>Interactive Seat Selection</h3>
          <p>Choose your preferred window, aisle, or extra-legroom seats before you fly.</p>
        </mat-card>

        <mat-card class="feature-card">
          <div class="feature-icon"><mat-icon>offline_pin</mat-icon></div>
          <h3>Instant PNR & E-Ticket</h3>
          <p>Get instant confirmed booking references and download print-ready e-tickets.</p>
        </mat-card>
      </div>
    </section>

    <!-- Popular Destinations -->
    <section class="destinations container">
      <h2 class="section-title">Popular Routes & Destinations</h2>
      <div class="destinations-grid">
        @for (dest of destinations; track dest.city) {
          <mat-card class="destination-card" [routerLink]="['/search']">
            <div class="dest-flag">{{ dest.flag }}</div>
            <h3 class="dest-city">{{ dest.city }}</h3>
            <p class="dest-country">{{ dest.country }}</p>
            <p class="dest-price">Fares from <strong>₹{{ dest.price.toLocaleString() }}</strong></p>
            <span class="dest-link">Book Now →</span>
          </mat-card>
        }
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats">
      <div class="stats-grid container">
        <div class="stat-item">
          <span class="stat-number">10+</span>
          <span class="stat-label">Leading Airlines</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">15+</span>
          <span class="stat-label">Global & Domestic Hubs</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">100%</span>
          <span class="stat-label">Live Inventory & PNR</span>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      background: linear-gradient(135deg, #0d1b3e 0%, #0d47a1 50%, #1976d2 100%);
      color: white;
      padding: 6rem 2rem 5rem;
      text-align: center;
      position: relative;
      overflow: hidden;
    }

    .hero-content {
      position: relative;
      z-index: 1;
      max-width: 750px;
      margin: 0 auto;
    }

    .hero-title {
      font-size: 3.2rem;
      font-weight: 800;
      margin-bottom: 1rem;
      letter-spacing: -0.02em;
      line-height: 1.15;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      opacity: 0.9;
      margin-bottom: 2.25rem;
      font-weight: 300;
    }

    .btn-hero {
      background: #ffb300 !important;
      color: #1a237e !important;
      padding: 1.4rem 2.8rem !important;
      border-radius: 50px !important;
      font-size: 1.15rem !important;
      font-weight: 700 !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 0.5rem !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
      transition: transform 0.2s, box-shadow 0.2s !important;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(255,179,0,0.4) !important;
      }
    }

    .features {
      padding: 4rem 1.5rem 3rem;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .feature-card {
      text-align: center;
      padding: 2.5rem 1.5rem;
      border-radius: 16px !important;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06) !important;

      .feature-icon {
        margin-bottom: 1rem;
        mat-icon {
          font-size: 2.5rem;
          width: 2.5rem;
          height: 2.5rem;
          color: #1a237e;
        }
      }

      h3 {
        font-size: 1.2rem;
        font-weight: 700;
        color: #1a237e;
        margin-bottom: 0.5rem;
      }

      p {
        color: #64748b;
        font-size: 0.95rem;
        line-height: 1.5;
      }
    }

    .destinations {
      padding: 2rem 1.5rem 4rem;
    }

    .section-title {
      font-size: 2rem;
      font-weight: 800;
      color: #1a237e;
      text-align: center;
      margin-bottom: 2rem;
    }

    .destinations-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    .destination-card {
      text-align: center;
      padding: 1.75rem 1.25rem;
      border-radius: 16px !important;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
      }

      .dest-flag {
        font-size: 2.8rem;
        margin-bottom: 0.5rem;
      }

      .dest-city {
        font-size: 1.15rem;
        font-weight: 700;
        color: #1a1a2e;
      }

      .dest-country {
        font-size: 0.85rem;
        color: #94a3b8;
        margin-bottom: 0.75rem;
      }

      .dest-price {
        font-size: 0.9rem;
        color: #64748b;
        margin-bottom: 0.5rem;

        strong {
          color: #2e7d32;
          font-size: 1.1rem;
        }
      }

      .dest-link {
        color: #1a237e;
        font-size: 0.85rem;
        font-weight: 700;
      }
    }

    .stats {
      background: linear-gradient(135deg, #0d47a1, #1565c0);
      padding: 3.5rem 1.5rem;
      color: white;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
      text-align: center;
    }

    .stat-number {
      display: block;
      font-size: 2.8rem;
      font-weight: 800;
    }

    .stat-label {
      font-size: 1rem;
      opacity: 0.85;
    }

    @media (max-width: 768px) {
      .hero-title { font-size: 2.2rem; }
      .features-grid { grid-template-columns: 1fr; }
      .destinations-grid { grid-template-columns: repeat(2, 1fr); }
      .stats-grid { grid-template-columns: 1fr; gap: 1.5rem; }
    }
  `]
})
export class HomeComponent {
  destinations = [
    { flag: '🇮🇳', city: 'Mumbai', country: 'India', price: 4500 },
    { flag: '🇮🇳', city: 'Bengaluru', country: 'India', price: 5800 },
    { flag: '🇮🇳', city: 'Goa', country: 'India', price: 5500 },
    { flag: '🇦🇪', city: 'Dubai', country: 'UAE', price: 18500 }
  ];
}
