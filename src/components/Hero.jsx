import React from 'react';
import './Hero.css';

export default function Hero({ photo = '/sol-hero.jpg' }) {
  return (
    <section className="sol-hero">
      <div className="sol-hero__inner">
        {/* LEFT — photo */}
        <div className="sol-hero__media">
          <img src={photo} alt="Sol the cat" />
          <div className="sol-hero__live">
            <span className="dot" />
            LIVE · Chasing a dust mote
          </div>
        </div>

        {/* RIGHT — text */}
        <div className="sol-hero__text">
          <p className="sol-hero__eyebrow">Athens, GR · reigning since 2021</p>

          <h1 className="sol-hero__title">
            Meet <em>Sol</em>.<br />
            A small cat with<br />
            big opinions.
          </h1>

          <p className="sol-hero__lede">
            A royal travel diary from 47 countries. Daily moods,
            live napcam, and royal loyalty badges to earn.
          </p>

          <div className="sol-hero__cta">
            <a href="/episodes" className="btn btn--primary">Read episodes</a>
            <a href="/gallery" className="btn btn--ghost">See photos →</a>
          </div>

          <ul className="sol-hero__stats">
            <li><strong>52</strong><span>episodes</span></li>
            <li><strong>47</strong><span>countries visited</span></li>
            <li><strong>14h</strong><span>napped today</span></li>
          </ul>
        </div>
      </div>
    </section>
  );
}
