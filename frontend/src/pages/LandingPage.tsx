import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring, useMotionValueEvent, AnimatePresence } from 'motion/react';
import { FileText, Package, Clock, CircleHelp, Lock, Ticket, Shield, Check, Plus, Menu, X } from 'lucide-react';
import './LandingPage.css';

/* ─── Custom Cursor (desktop only) ─── */
const CustomCursor = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!globalThis.matchMedia('(pointer: fine)').matches) return;
    let rafId: number;
    let mx = 0, my = 0, cx = 0, cy = 0;
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    globalThis.addEventListener('mousemove', onMove, { passive: true });
    const tick = () => {
      cx += (mx - cx) * 0.15;
      cy += (my - cy) * 0.15;
      if (ref.current)
        ref.current.style.transform = `translate3d(${cx}px,${cy}px,0) translate(-50%,-50%)`;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => { globalThis.removeEventListener('mousemove', onMove); cancelAnimationFrame(rafId); };
  }, []);
  return <div id="lp-cursor" ref={ref} />;
};

/* ─── Scroll Progress Bar ─── */
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return <motion.div className="lp-progress" style={{ scaleX }} />;
};

/* ─── ScrollColorReveal Heading ─── */
const ScrollColorReveal = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLHeadingElement>(null);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const windowH = globalThis.innerHeight;
    const start = windowH * 0.85;
    const end = windowH * 0.2;
    const pct = Math.max(0, Math.min(100, ((start - rect.top) / (start - end)) * 100));
    ref.current.style.setProperty('--lp-reveal-pct', `${pct}%`);
  });

  return (
    <h2 ref={ref} className={`lp-reveal-heading ${className}`}>{children}</h2>
  );
};

/* ─── Monumental BG Word ─── */
const BgWord = ({ word }: { word: string }) => (
  <div className="lp-bg-word" aria-hidden="true">{word}</div>
);

/* ─── Divider ─── */
const ReceiptDivider = () => (
  <div className="lp-divider">· · · · · · · · · · · · · · ·</div>
);

/* ─── Navbar ─── */
const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled((globalThis.scrollY ?? 0) > 20);
    globalThis.addEventListener('scroll', fn, { passive: true });
    return () => globalThis.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; }, [open]);

  const scrollTo = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav className={`lp-nav${scrolled ? ' scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <button className="lp-logo" onClick={() => globalThis.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span style={{ color: 'inherit' }}>Caixa</span><span style={{ color: 'var(--lp-amber)' }}>Facil</span>
          </button>

          <ul className="lp-nav-links">
            <li><button onClick={() => scrollTo('sobre')}>Funcionalidades</button></li>
            <li><button onClick={() => scrollTo('fluxo')}>Como funciona</button></li>
            <li><button onClick={() => scrollTo('seguranca')}>Segurança</button></li>
          </ul>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="lp-nav-actions">
            <button
              onClick={() => navigate('/login')}
              style={{ background: 'none', border: 'none', color: 'var(--lp-muted)', fontFamily: 'var(--lp-font-sans)', fontSize: 'var(--lp-body)', cursor: 'pointer', transition: 'color 0.2s', textDecoration: 'underline', textUnderlineOffset: '3px' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--lp-text)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--lp-muted)')}
            >
              Já tenho acesso
            </button>
            <button className="lp-nav-cta" onClick={() => scrollTo('cta')}>Solicitar acesso</button>
          </div>
          <button className="lp-hamburger" onClick={() => setOpen(true)} aria-label="Abrir menu">
            <Menu size={26} />
          </button>
        </div>
      </nav>

      <div className={`lp-drawer${open ? ' open' : ''}`} aria-hidden={!open}>
        <button className="lp-drawer-close" onClick={() => setOpen(false)} aria-label="Fechar">
          <X size={30} />
        </button>
        <button className="lp-drawer-btn" onClick={() => scrollTo('sobre')}>Funcionalidades</button>
        <button className="lp-drawer-btn" onClick={() => scrollTo('fluxo')}>Como funciona</button>
        <button className="lp-drawer-btn" onClick={() => scrollTo('seguranca')}>Segurança</button>
        <div className="lp-drawer-cta-wrap">
          <button className="lp-drawer-cta-btn" onClick={() => { setOpen(false); scrollTo('cta'); }}>
            Solicitar acesso
          </button>
          <button
            onClick={() => { setOpen(false); navigate('/login'); }}
            style={{ display: 'block', width: '100%', marginTop: '0.75rem', background: 'none', border: '1px solid var(--lp-border)', color: 'var(--lp-muted)', fontFamily: 'var(--lp-font-sans)', fontSize: 'var(--lp-body)', height: '48px', borderRadius: '6px', cursor: 'pointer' }}
          >
            Já tenho acesso
          </button>
        </div>
      </div>
    </>
  );
};

/* ─── Já tenho acesso link ─── */
const HeroLoginLink = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/login')}
      style={{
        background: 'none', border: 'none', padding: 0,
        color: 'var(--lp-muted)', fontFamily: 'var(--lp-font-sans)',
        fontSize: 'var(--lp-body)', cursor: 'pointer',
        textDecoration: 'underline', textUnderlineOffset: '3px',
        textDecorationColor: 'rgba(122,112,96,0.4)',
        transition: 'color 0.2s',
        display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
      }}
      onMouseEnter={e => (e.currentTarget.style.color = 'var(--lp-amber)')}
      onMouseLeave={e => (e.currentTarget.style.color = 'var(--lp-muted)')}
    >
      Já tenho acesso →
    </button>
  );
};

/* ─── Hero ─── */
const Hero = () => (
  <section className="lp-hero lp-hero-noise">
    <BgWord word="START" />
    <div className="lp-hero-grid">
      {/* Copy */}
      <div>
        <motion.span
          className="lp-badge"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          PDV · ESTOQUE · FICHAS · FECHAMENTO
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.05 }}
        >
          Controle total do seu caixa, do primeiro item ao fechamento.
        </motion.h1>

        <motion.p
          className="lp-hero-desc"
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
        >
          Sistema de ponto de venda criado para quem trabalha de verdade.
          PDV touch-first, fichas de clientes, estoque em tempo real e
          relatório diário — tudo integrado, tudo auditado.
        </motion.p>

        <motion.div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.28, ease: 'easeOut' }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', alignItems: 'center' }}>
            <button className="lp-btn-primary" onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}>
              Solicitar acesso
            </button>
            <button className="lp-btn-secondary" onClick={() => document.getElementById('sobre')?.scrollIntoView({ behavior: 'smooth' })}>
              Ver funcionalidades
            </button>
          </div>
          <HeroLoginLink />
        </motion.div>
      </div>

      {/* Visual */}
      <div className="lp-hero-visual">
        <div className="lp-hero-cards-wrap">
          {/* Back card */}
          <motion.div
            className="lp-hcard lp-hcard-back"
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 0.8, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--lp-border)' }}>
              <p style={{ fontFamily: 'var(--lp-font-mono)', fontSize: '0.7rem', color: 'var(--lp-muted)', margin: 0 }}>Ficha #003</p>
              <p style={{ fontWeight: 600, marginTop: '0.2rem', marginBottom: 0 }}>Mesa 04</p>
            </div>
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[['X-Burguer', 'R$ 18,00'], ['Coca-Cola', 'R$ 7,00']].map(([n, p]) => (
                <div key={n} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--lp-font-mono)', fontSize: '0.65rem', color: 'var(--lp-muted)' }}>
                  <span>{n}</span><span>{p}</span>
                </div>
              ))}
              <div style={{ marginTop: '0.875rem', paddingTop: '0.625rem', borderTop: '1px solid var(--lp-border)', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--lp-font-mono)', fontSize: '0.75rem', color: 'var(--lp-amber)', fontWeight: 700 }}>
                <span>TOTAL</span><span>R$ 25,00</span>
              </div>
            </div>
          </motion.div>

          {/* Side card */}
          <motion.div
            className="lp-hcard lp-hcard-side"
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 0.9, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--lp-border)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: 'var(--lp-green)' }} />
              <p style={{ fontFamily: 'var(--lp-font-mono)', fontSize: '0.7rem', color: 'var(--lp-muted)', margin: 0 }}>CAIXA FECHADO</p>
            </div>
            <div style={{ padding: '1rem', fontFamily: 'var(--lp-font-mono)', fontSize: '0.65rem', color: 'var(--lp-muted)', lineHeight: 1.9 }}>
              {'>'} processando...<br />RESUMO: R$ 1.847,50<br />ITENS: 87<br />STATUS: OK
            </div>
          </motion.div>

          {/* Main card */}
          <motion.div
            className="lp-hcard lp-hcard-main"
            initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="lp-hcard-header">Caixa Fácil</div>
            <div className="lp-hcard-body">
              {[
                { name: 'X-Bacon Duplo', price: 'R$ 24,00' },
                { name: 'X-Salada', price: 'R$ 16,00' },
                { name: 'Cerveja Long Neck', price: 'R$ 12,00' },
                { name: 'Porção Batata P', price: 'R$ 18,00' },
              ].map((it) => (
                <div key={it.name} className="lp-hcard-item">
                  <span className="lp-hcard-item-name">{it.name}</span>
                  <span className="lp-hcard-item-price">{it.price}</span>
                </div>
              ))}
            </div>
            <div className="lp-hcard-footer">
              <div className="lp-hcard-total">
                <span className="lp-hcard-total-label">Cobrar</span>
                <span className="lp-hcard-total-value">R$ 70,00</span>
              </div>
            </div>
          </motion.div>

          {/* Badge */}
          <motion.div
            className="lp-hero-badge"
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, type: 'spring', stiffness: 200 }}
          >
            <div style={{ position: 'relative' }}>
              <div className="lp-badge-glow" />
              <div className="lp-badge-inner"><span>⚡</span> {'< 300ms por ação'}</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  </section>
);

/* ─── Credibility Marquee ─── */
const Credibility = () => {
  const items = ['58 commits', '·', 'TypeScript 67%', '·', '4 Módulos', '·', 'SQLite', '·', 'React 19', '·', 'Vite', '·'];
  return (
    <div className="lp-cred">
      <div className="lp-cred-track">
        {[0, 1].map(set => (
          <div key={set} className="lp-cred-set">
            {items.map((item, itemIdx) => (
              <span key={`${set}-${itemIdx}`} className={item === '·' ? 'lp-cred-sep' : ''}>{item}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Pain Cards ─── */
const PAINS = [
  { icon: FileText, num: '01', title: 'A ficha de papel que sumiu no bolso', desc: 'Ninguém lembra o valor. O prejuízo fica pra você.' },
  { icon: Package, num: '02', title: 'O estoque que virou surpresa', desc: 'Acabou o produto. O cliente já escolheu. Situação chata.' },
  { icon: Clock, num: '03', title: 'O fechamento que levou mais de uma hora', desc: 'Conferindo papel por papel, calculando na mão, com erro.' },
  { icon: CircleHelp, num: '04', title: 'Não saber o que entrou hoje', desc: 'Fim do dia sem clareza real dos números do negócio.' },
];

const PainSection = () => (
  <section id="sobre" className="lp-section lp-container-md" style={{ position: 'relative', overflow: 'hidden' }}>
    <BgWord word="DOR" />
    <motion.h2
      className="lp-section-h2"
      style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
    >
      Você conhece essa história?
    </motion.h2>
    <div className="lp-pain-grid">
      {PAINS.map((p) => (
        <motion.div
          key={p.num}
          className="lp-pain-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' as any }}
          transition={{ duration: 0.55, delay: i * 0.08 }}
        >
          <span className="lp-pain-num">{p.num}</span>
          <div className="lp-pain-icon"><p.icon strokeWidth={1.5} size={26} /></div>
          <h3 className="lp-pain-title">{p.title}</h3>
          <p className="lp-pain-desc">{p.desc}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

/* ─── POS Mockup ─── */
const POSMockup = () => {
  const [items, setItems] = useState([
    { name: 'Refrigerante Lata', price: 6 },
    { name: 'X-Tudo', price: 28 },
  ]);
  useEffect(() => {
    const id = setInterval(() => {
      setItems(prev =>
        prev.length >= 4
          ? [{ name: 'Refrigerante Lata', price: 6 }, { name: 'X-Tudo', price: 28 }]
          : [...prev, { name: 'Porção Batata', price: 22 }]
      );
    }, 2400);
    return () => clearInterval(id);
  }, []);
  const total = items.reduce((a, i) => a + i.price, 0);

  return (
    <div className="lp-pos-mockup">
      <div className="lp-pos-header">
        <span className="lp-pos-title">Mesa 12</span>
        <span className="lp-pos-status">ABERTO</span>
      </div>
      <div className="lp-pos-body">
        <AnimatePresence initial={false}>
          {items.map((item, i) => (
            <motion.div
              key={`${i}-${item.name}`}
              className="lp-pos-item"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.28 }}
            >
              <span>{item.name}</span>
              <span className="lp-pos-item-price">R$ {item.price},00</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <button className="lp-pos-add" aria-label="Adicionar"><Plus size={20} strokeWidth={2.5} /></button>
      </div>
      <div className="lp-pos-footer">
        <span className="lp-pos-total-label">Total</span>
        <span className="lp-pos-total-value">R$ {total},00</span>
      </div>
    </div>
  );
};

const POS = () => (
  <section className="lp-section lp-container" style={{ position: 'relative', overflow: 'hidden' }}>
    <BgWord word="PDV" />
    <div className="lp-pos-grid" style={{ position: 'relative', zIndex: 1 }}>
      <div>
        <ScrollColorReveal>Cada segundo atrás do balcão conta.</ScrollColorReveal>
        <p className="lp-pos-subtext">
          Interface touch-first desenhada para velocidade. Busca instantânea, carrinho visual,
          pagamentos à vista ou na ficha, e baixa automática de estoque — tudo em menos de 300ms.
          <br /><br />
          <strong style={{ color: 'var(--lp-text)', fontWeight: 700 }}>Sem delay. Sem bug. Sem fila.</strong>
        </p>
        <div className="lp-pos-stats">
          <div><div className="lp-stat-value lp-stat-amber">{'< 300ms'}</div><div className="lp-stat-label">por ação</div></div>
          <div><div className="lp-stat-value">Touch-first</div><div className="lp-stat-label">interface</div></div>
          <div><div className="lp-stat-value">Auto-sync</div><div className="lp-stat-label">de estoque</div></div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <POSMockup />
      </div>
    </div>
  </section>
);

/* ─── Fichas ─── */
const Fichas = () => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.45 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="fluxo" className="lp-fichas-wrap" style={{ position: 'relative', overflow: 'hidden' }}>
      <BgWord word="FICHAS" />
      <div className="lp-fichas-inner" style={{ position: 'relative', zIndex: 1 }}>
        <div className="lp-fichas-stack" ref={ref}>
          <motion.div className="lp-ficha lp-ficha-b" animate={{ rotate: inView ? -4 : -1, x: inView ? -22 : 0, y: inView ? 12 : 0 }} transition={{ duration: 0.75 }} />
          <motion.div className="lp-ficha lp-ficha-m" animate={{ rotate: inView ? 3 : 1, x: inView ? 22 : 0, y: inView ? 6 : 0 }} transition={{ duration: 0.75 }} />
          <motion.div className="lp-ficha lp-ficha-f" animate={{ y: inView ? -12 : 0 }} transition={{ duration: 0.75 }}>
            <div className="lp-ficha-row">
              <span>João Silva</span><span className="lp-ficha-id">Ficha #003</span>
            </div>
            <div className="lp-ficha-sep">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
            <div className="lp-ficha-items">
              <div className="lp-ficha-item"><span>X-Burguer</span><span>R$ 18,00</span></div>
              <div className="lp-ficha-item"><span>Coca-Cola 600ml</span><span>R$  7,00</span></div>
              <div className="lp-ficha-item"><span>Batata Frita</span><span>R$ 12,00</span></div>
            </div>
            <div className="lp-ficha-sep" style={{ marginTop: '0.875rem' }}>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
            <div className="lp-ficha-total">
              <span>TOTAL</span>
              <span className="lp-check-icon">
                {inView && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.55 }}>
                    <Check size={16} strokeWidth={3} />
                  </motion.span>
                )}
                {inView ? 'R$ 0,00 ✓' : 'R$ 37,00'}
              </span>
            </div>
          </motion.div>
        </div>

        <motion.h2 className="lp-section-h2" style={{ fontWeight: 900, letterSpacing: '-0.04em' }}
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          A ficha que nunca se perde.
        </motion.h2>
        <motion.p className="lp-fichas-desc"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
          Abra uma conta por cliente. Adicione pedidos durante todo o dia. Na hora de ir embora, liquida tudo de uma vez — com valor exato, histórico completo e zero margem para dúvida.
        </motion.p>
        <motion.div className="lp-pills"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
          {['Sem papel', 'Sem divergência', 'Histórico completo'].map((p) => (
            <span key={p} className="lp-pill">{p}</span>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

/* ─── Terminal Animation ─── */
const TerminalAnim = () => {
  const LINES: { text: string; cls: string; delay?: number }[] = [
    { text: '$ caixafacil --fechar-dia', cls: 'lt-default' },
    { text: '> Calculando movimentações...', cls: 'lt-muted', delay: 400 },
    { text: 'RESUMO FINANCEIRO .... R$ 1.847,50', cls: 'lt-amber', delay: 900 },
    { text: 'FICHAS LIQUIDADAS .... 12', cls: 'lt-muted', delay: 1050 },
    { text: 'FICHAS ABERTAS ....... 0', cls: 'lt-muted', delay: 1150 },
    { text: 'ITENS VENDIDOS ....... 87', cls: 'lt-muted', delay: 1250 },
    { text: 'PAGTOS À VISTA ....... R$ 1.340,00', cls: 'lt-muted', delay: 1350 },
    { text: 'PAGTOS VIA FICHA ..... R$   507,50', cls: 'lt-muted', delay: 1450 },
    { text: '──────────────────────────────────', cls: 'lt-border', delay: 1550 },
    { text: 'STATUS ............... FECHADO ✓', cls: 'lt-green', delay: 1800 },
    { text: 'DATA ................. 25-01-15 23:47', cls: 'lt-muted', delay: 1950 },
  ];
  const [vis, setVis] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    const ids: ReturnType<typeof setTimeout>[] = [];
    LINES.forEach((l, i) => ids.push(setTimeout(() => setVis(i + 1), l.delay ?? i * 80)));
    return () => ids.forEach(clearTimeout);
  }, [started]); // eslint-disable-line

  return (
    <motion.div className="lp-terminal"
      onViewportEnter={() => setStarted(true)}
      viewport={{ once: true, margin: '-80px' as any }}
    >
      <div className="lp-term-bar">
        <div className="lp-dot lp-dot-r" /><div className="lp-dot lp-dot-y" /><div className="lp-dot lp-dot-g" />
      </div>
      <div className="lp-term-body">
        {LINES.slice(0, vis).map((l) => <div key={l.text} className={l.cls}>{l.text}</div>)}
        {started && vis < LINES.length && <span className="lp-blink" />}
      </div>
    </motion.div>
  );
};

/* ─── Fechamento ─── */
const Fechamento = () => (
  <section className="lp-section lp-container" style={{ position: 'relative', overflow: 'hidden' }}>
    <BgWord word="CLOSE" />
    <div className="lp-fecha-grid" style={{ position: 'relative', zIndex: 1 }}>
      <div className="lp-fecha-visual"><TerminalAnim /></div>
      <div className="lp-fecha-text">
        <ScrollColorReveal>Fecha uma vez. Imutável. Sempre.</ScrollColorReveal>
        <p className="lp-fecha-desc">
          Ao encerrar o dia, o sistema congela os dados e gera o relatório completo. Sem reabertura, sem edição retroativa, sem dúvida sobre o que realmente aconteceu.
        </p>
        <div className="lp-quote">
          <p>"Uma operação por dia. Um relatório definitivo."</p>
        </div>
      </div>
    </div>
  </section>
);

/* ─── Estoque ─── */
const Estoque = () => (
  <section className="lp-section lp-container" style={{ position: 'relative', overflow: 'hidden' }}>
    <BgWord word="ESTOQUE" />
    <div style={{ position: 'relative', zIndex: 1 }}>
      <ScrollColorReveal>Nada entra ou sai sem registro.</ScrollColorReveal>
      <div className="lp-est-grid">
        {[
          { title: 'Entrada e Saída', desc: 'Cada venda desconta automaticamente. Cada reposição manual fica registrada com timestamp e responsável.' },
          {
            title: 'Bloqueio Automático', desc: 'Quando o estoque chega a zero, o item recebe o badge ESGOTADO e fica inacessível no PDV.', badge: true
          },
          { title: 'Auditoria Completa', desc: 'Todo ajuste manual gera um log imutável. Nada some sem rastro. Nada muda sem registro.' },
        ].map((col, i) => (
          <motion.div key={i} className="lp-est-col"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
            <h3 className="lp-section-h3">{col.title}</h3>
            <p className="lp-est-desc">{col.desc}</p>
            {col.badge && (
              <motion.div className="lp-esgotado"
                initial={{ opacity: 0, scale: 2, rotate: -15 }}
                whileInView={{ opacity: 1, scale: 1, rotate: -5 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.4 }}>
                ESGOTADO
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── Segurança ─── */
const Seguranca = () => (
  <section id="seguranca" className="lp-seg-wrap" style={{ position: 'relative', overflow: 'hidden' }}>
    <BgWord word="DEFESA" />
    <div className="lp-container" style={{ position: 'relative', zIndex: 1 }}>
      <div className="lp-seg-grid">
        {[
          { icon: Lock, title: 'Níveis de Acesso', desc: 'Permissões granulares por função. Operador não vê o que não deve.' },
          { icon: Ticket, title: 'Suporte Integrado', desc: 'Sistema de chamados nativo. Tudo registrado dentro da plataforma.' },
          { icon: Shield, title: 'Dados Protegidos', desc: 'Autenticação com níveis de segurança e logs de sessão auditados.' },
        ].map((p, i) => (
          <motion.div key={i} className="lp-seg-col"
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
            <div className="lp-seg-icon"><p.icon size={24} strokeWidth={1.5} /></div>
            <h4 className="lp-seg-title">{p.title}</h4>
            <p className="lp-seg-desc">{p.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── CTA ─── */
interface CTAProps {
  nomeNegocio: string;
  setNomeNegocio: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  telefone: string;
  setTelefone: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  status: 'idle' | 'loading' | 'success' | 'error';
  feedbackMsg: string;
}

const CTA = ({ nomeNegocio, setNomeNegocio, email, setEmail, telefone, setTelefone, onSubmit, status, feedbackMsg }: CTAProps) => (
  <section id="cta" className="lp-cta">
    <div className="lp-cta-noise" />
    <div className="lp-cta-inner">
      <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        Pronto pra colocar seu caixa em ordem?
      </motion.h2>
      <motion.p className="lp-cta-sub" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
        Sem planilha. Sem papel. Sem improviso.
      </motion.p>

      {status === 'success' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 12, padding: '24px 32px', textAlign: 'center', marginTop: 24 }}
        >
          <div style={{ fontSize: 40 }}>🎉</div>
          <p style={{ color: '#86efac', fontWeight: 700, marginTop: 8 }}>Solicitação enviada!</p>
          <p style={{ color: '#6ee7b7', fontSize: 14, marginTop: 4 }}>Em breve entraremos em contato.</p>
        </motion.div>
      ) : (
        <motion.form
          className="lp-cta-form" onSubmit={onSubmit}
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
        >
          <input
            id="cta-nome"
            type="text" required placeholder="Nome do negócio"
            className="lp-cta-input" value={nomeNegocio}
            onChange={e => setNomeNegocio(e.target.value)}
          />
          <input
            id="cta-email"
            type="email" required placeholder="Seu e-mail"
            className="lp-cta-input" value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            id="cta-telefone"
            type="tel" placeholder="WhatsApp (opcional)"
            className="lp-cta-input" value={telefone}
            onChange={e => setTelefone(e.target.value)}
          />
          {feedbackMsg && status === 'error' && (
            <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center' }}>{feedbackMsg}</p>
          )}
          <button
            type="submit" className="lp-cta-submit"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Enviando...' : 'Quero acesso →'}
          </button>
        </motion.form>
      )}

      <motion.p className="lp-cta-fine" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
        Sem compromisso. Sem cartão de crédito.
      </motion.p>
    </div>
  </section>
);

/* ─── Footer ─── */
const Footer = () => (
  <footer className="lp-footer">
    <div className="lp-footer-main lp-container">
      <div className="lp-footer-grid">
        <div>
          <span style={{ fontFamily: 'var(--lp-font-sans)', fontWeight: 800, fontSize: 'var(--lp-h3)', letterSpacing: '-0.04em' }}>
            Caixa<span style={{ color: 'var(--lp-amber)' }}>Facil</span>
          </span>
          <p className="lp-footer-desc">Controle total do seu caixa.</p>
        </div>
        <nav className="lp-footer-links">
          <a href="#sobre">Funcionalidades</a>
          <a href="#fluxo">Como funciona</a>
          <a href="#seguranca">Segurança</a>
          <a href="#cta">Contato</a>
        </nav>
        <div className="lp-footer-tech">
          <span>TypeScript · React · Vite</span>
          <span>Desenvolvido em Blumenau, SC 🇧🇷</span>
          <a href="https://github.com/Kevinnc1227/CaixaFacil_Alvorada" target="_blank" rel="noreferrer">
            github.com/Kevinnc1227
          </a>
        </div>
      </div>
    </div>

    {/* Monumental wordmark */}
    <motion.div
      className="lp-footer-wordmark"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' as any }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <span style={{ color: 'inherit' }}>Caixa</span><span style={{ color: 'var(--lp-amber)' }}>Facil</span>
    </motion.div>

    <p className="lp-footer-copy">© 2025 CaixaFacil — Todos os direitos reservados</p>
  </footer>
);

/* ─── Page Export ─── */
export default function LandingPage() {
  const [nomeNegocio, setNomeNegocio] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const handleCTASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');
    try {
      const res = await fetch('http://localhost:3001/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomeNegocio, email, telefone: telefone || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao enviar');
      }
      setFormStatus('success');
    } catch (err: any) {
      setFeedbackMsg(err.message);
      setFormStatus('error');
    }
  };

  return (
    <div className="lp-root">
      <CustomCursor />
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <Credibility />
        <PainSection />
        <ReceiptDivider />
        <POS />
        <ReceiptDivider />
        <Fichas />
        <ReceiptDivider />
        <Fechamento />
        <Estoque />
        <Seguranca />
        <CTA
          nomeNegocio={nomeNegocio} setNomeNegocio={setNomeNegocio}
          email={email} setEmail={setEmail}
          telefone={telefone} setTelefone={setTelefone}
          onSubmit={handleCTASubmit}
          status={formStatus} feedbackMsg={feedbackMsg}
        />
      </main>
      <Footer />
    </div>
  );
}
