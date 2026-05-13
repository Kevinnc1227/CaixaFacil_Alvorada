import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { FileText, Package, Clock, CircleHelp, Lock, Ticket, Shield, Check, Plus, Menu, X } from 'lucide-react';

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // We only enable the custom cursor logic if the media query matches pointer: fine
    const isPointerFine = window.matchMedia('(pointer: fine)').matches;
    if (!isPointerFine) return;

    let requestRef: number;
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', onMouseMove);

    const tick = () => {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
      }
      requestRef = requestAnimationFrame(tick);
    };

    requestRef = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(requestRef);
    };
  }, []);

  return <div id="custom-cursor" ref={cursorRef} />;
};

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] bg-accent-amber origin-left z-50"
      style={{ scaleX }}
    />
  );
};

const ReceiptDivider = () => (
  <div className="w-full receipt-divider py-12">
    · · · · · · · · · · · · · · ·
  </div>
);

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
  }, [drawerOpen]);

  const scrollTo = (id: string) => {
    setDrawerOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-40 transition-all duration-300 backdrop-blur-[20px] bg-bg-base/80 border-b ${scrolled ? 'border-border-main' : 'border-transparent'}`}>
        <div className="max-w-[1200px] w-[min(100%-2.5rem,1200px)] mx-auto h-20 flex items-center justify-between">
          <div className="flex items-baseline gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <span className="font-syne font-bold text-[var(--text-h3)] tracking-tight">
              Caixa<span className="text-accent-amber">Facil</span>
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-dm text-[var(--text-body)]">
            <button onClick={() => scrollTo('sobre')} className="text-text-primary hover:text-accent-amber transition-colors">Funcionalidades</button>
            <button onClick={() => scrollTo('fluxo')} className="text-text-primary hover:text-accent-amber transition-colors">Como funciona</button>
            <button onClick={() => scrollTo('seguranca')} className="text-text-primary hover:text-accent-amber transition-colors">Segurança</button>
          </div>

          <button onClick={() => scrollTo('cta')} className="hidden md:block bg-accent-amber text-bg-base font-semibold px-5 py-2.5 rounded-md hover:bg-accent-orange transition-colors duration-300 font-dm text-[var(--text-body)]">
            Solicitar acesso
          </button>
          
          <button className="md:hidden p-2 text-text-primary -mr-2" onClick={() => setDrawerOpen(true)}>
            <Menu size={28} />
          </button>
        </div>
      </nav>

      <div className={`fixed inset-0 z-50 bg-bg-base flex flex-col justify-center items-center gap-8 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] ${drawerOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <button className="absolute top-6 right-6 p-4 text-text-primary" onClick={() => setDrawerOpen(false)}>
          <X size={32} />
        </button>
        
        <button onClick={() => scrollTo('sobre')} className="font-syne font-bold text-[var(--text-h2)] text-text-primary">Funcionalidades</button>
        <button onClick={() => scrollTo('fluxo')} className="font-syne font-bold text-[var(--text-h2)] text-text-primary">Como funciona</button>
        <button onClick={() => scrollTo('seguranca')} className="font-syne font-bold text-[var(--text-h2)] text-text-primary">Segurança</button>
        
        <div className="w-full px-6 mt-8 max-w-sm">
          <button onClick={() => scrollTo('cta')} className="w-full h-[52px] bg-accent-amber text-bg-base font-semibold rounded-md font-dm text-[var(--text-body-lg)]">
            Solicitar acesso
          </button>
        </div>
      </div>
    </>
  );
};

const HeroCard = ({ className, children, delay = 0 }: { className?: string, children: React.ReactNode, delay?: number }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={`absolute border border-border-main bg-bg-surface rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
};

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-28 pb-16 overflow-hidden radial-hero">
      <div className="noise-overlay" />
      <div className="max-w-[1200px] w-[min(100%-2.5rem,1200px)] mx-auto grid lg:grid-cols-[55%_45%] gap-12 lg:gap-8 relative z-20">
        
        {/* Copy */}
        <div className="flex flex-col justify-center w-full max-w-xl mx-auto lg:mx-0">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex items-center gap-2 mb-6"
          >
            <span className="bg-accent-amber/10 text-accent-amber font-mono text-[var(--text-mono-sm)] px-3 py-1 rounded-full border border-accent-amber/20 tracking-wider">
              PDV · ESTOQUE · FICHAS · FECHAMENTO
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-syne font-extrabold text-[var(--text-hero)] leading-[1.05] text-text-primary tracking-tight mb-6"
          >
            Controle total do seu caixa, do primeiro item ao fechamento.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="font-dm text-[var(--text-body-lg)] text-text-muted leading-relaxed max-w-[480px] mb-10"
          >
            Sistema de ponto de venda criado para quem trabalha de verdade. 
            PDV touch-first, fichas de clientes, estoque em tempo real e 
            relatório diário — tudo integrado, tudo auditado.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto"
          >
            <button 
              onClick={() => { document.getElementById('cta')?.scrollIntoView({behavior:'smooth'}) }}
              className="w-full sm:w-auto px-6 h-[52px] rounded-md bg-accent-amber text-bg-base font-dm font-semibold shadow-[0_4px_20px_#E85D0440] hover:bg-accent-orange transition-all text-[var(--text-body)]"
            >
              Solicitar acesso
            </button>
            <button 
              onClick={() => { document.getElementById('sobre')?.scrollIntoView({behavior:'smooth'}) }}
              className="w-full sm:w-auto px-6 h-[52px] rounded-md border border-accent-amber text-accent-amber font-dm font-medium hover:bg-accent-amber/5 transition-colors text-[var(--text-body)]"
            >
               Ver funcionalidades
            </button>
          </motion.div>
        </div>

        {/* Visual */}
        <div className="relative w-full flex items-center justify-center lg:justify-end mt-8 lg:mt-0 hero-cards">
          <div className="relative w-full max-w-[340px] lg:max-w-[320px] h-[380px] lg:h-[400px] lg:[transform:rotateX(8deg)_rotateY(-12deg)] lg:perspective-1000 preserve-3d">
            
            <HeroCard className="hidden lg:block w-56 h-64 -top-16 -left-12 opacity-80 backdrop-blur-sm" delay={0.6}>
               <div className="p-4 border-b border-border-main/50">
                 <p className="font-mono text-xs text-text-muted">Ficha #003</p>
                 <p className="font-dm font-medium mt-1">Mesa 04</p>
               </div>
               <div className="p-4 flex flex-col gap-3">
                 <div className="flex justify-between font-mono text-[10px] text-text-muted">
                    <span>X-Burguer</span><span>R$ 18,00</span>
                 </div>
                 <div className="flex justify-between font-mono text-[10px] text-text-muted">
                    <span>Coca-Cola</span><span>R$ 7,00</span>
                 </div>
                 <div className="mt-4 pt-3 border-t border-border-main/50 flex justify-between font-mono text-xs text-accent-amber">
                    <span>TOTAL</span><span>R$ 25,00</span>
                 </div>
               </div>
            </HeroCard>

            <HeroCard className="hidden lg:block w-60 h-72 top-24 -right-16 opacity-90 backdrop-blur-sm" delay={0.5}>
               <div className="p-4 border-b border-border-main/50 flex gap-2 items-center">
                 <div className="w-2 h-2 rounded-full bg-accent-green" />
                 <p className="font-mono text-xs text-text-muted">CAIXA FECHADO</p>
               </div>
               <div className="p-4 bg-bg-base/30 h-full font-mono text-[10px] text-text-muted leading-relaxed">
                 {'>'} processando...<br/>
                 RESUMO: R$ 1.847,50<br/>
                 ITENS: 87<br/>
                 STATUS: OK<br/>
               </div>
            </HeroCard>

            <HeroCard className="w-full h-full lg:w-72 lg:h-[340px] z-10 bottom-0 left-0 bg-bg-surface border-accent-amber/20" delay={0.4}>
              <div className="p-5 border-b border-border-main">
                <p className="font-syne font-semibold text-[var(--text-h3)]">Caixa Fácil</p>
              </div>
              <div className="p-4 flex flex-col gap-3">
                {[
                  { name: 'X-Bacon Duplo', price: 'R$ 24,00' },
                  { name: 'X-Salada', price: 'R$ 16,00' },
                  { name: 'Cerveja Long Neck', price: 'R$ 12,00' },
                  { name: 'Porção Batata P', price: 'R$ 18,00' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-md bg-bg-elevated border border-border-main">
                    <span className="font-dm text-[var(--text-body)]">{item.name}</span>
                    <span className="font-mono text-[var(--text-mono-sm)] text-text-muted">{item.price}</span>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-0 w-full p-4 bg-bg-elevated border-t border-border-main">
                 <div className="flex justify-between items-center bg-accent-green/20 border border-accent-green rounded-md p-3">
                    <span className="font-dm font-medium text-accent-green text-[var(--text-body)]">Cobrar</span>
                    <span className="font-mono font-semibold text-accent-green text-[var(--text-mono-lg)]">R$ 70,00</span>
                 </div>
              </div>
            </HeroCard>

            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, type: 'spring' }}
              className="absolute -top-4 -right-2 lg:-right-8 z-20 scale-90 lg:scale-100"
            >
               <div className="relative">
                 <div className="absolute inset-0 bg-accent-amber rounded-full mix-blend-screen animate-[pulse_2s_infinite]" style={{ filter: 'blur(8px)', opacity: 0.6 }} />
                 <div className="bg-accent-amber text-bg-base font-mono text-xs font-semibold px-4 py-2 rounded-full relative z-10 shadow-lg flex items-center gap-1.5 min-w-max">
                   <span>⚡</span> {'<'} 300ms por ação
                 </div>
               </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};

const Credibility = () => (
  <div className="w-full border-y border-border-main bg-bg-surface py-3 overflow-hidden">
    <div className="max-w-[1200px] w-[min(100%-2.5rem,1200px)] mx-auto whitespace-nowrap overflow-x-auto no-scrollbar text-center">
      <span className="font-mono text-[var(--text-mono-sm)] text-text-muted inline-flex items-center gap-6">
        <span>58 commits ativos</span>
        <span>·</span>
        <span>TypeScript 67%</span>
        <span>·</span>
        <span>4 módulos integrados</span>
      </span>
    </div>
  </div>
);

const PainCard = ({ title, desc, icon: Icon, delay }: { title: string, desc: string, icon: React.ElementType, delay: number, key?: React.Key }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" as any }}
    transition={{ duration: 0.6, delay }}
    className="bg-bg-surface border border-border-main p-6 rounded-lg hover-card flex flex-col gap-4"
  >
    <div className="text-text-muted">
      <Icon strokeWidth={1.5} size={28} />
    </div>
    <h3 className="font-syne italic font-semibold text-[var(--text-h3)] text-text-primary leading-tight">"{title}"</h3>
    <p className="font-dm text-text-muted text-[var(--text-body)]">{desc}</p>
  </motion.div>
);

const Pain = () => {
  const pains = [
    { icon: FileText, title: "A ficha de papel que sumiu no bolso do cliente", desc: "Ninguém lembra o valor. O prejuízo fica pra você." },
    { icon: Package, title: "O estoque que virou surpresa no meio do movimento", desc: "Acabou o produto. O cliente já escolheu. Situação chata." },
    { icon: Clock, title: "O fechamento de caixa que levou mais de uma hora", desc: "Conferindo papel por papel, calculando na mão, com erro." },
    { icon: CircleHelp, title: "Não saber exatamente o que entrou hoje", desc: "Fim do dia sem clareza real dos números." },
  ];

  return (
    <section id="sobre" className="py-24 px-6 max-w-[1000px] mx-auto w-[min(100%-2.5rem,1000px)]">
      <motion.h2 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center font-syne font-bold text-[var(--text-h2)] mb-12 sm:mb-16"
      >
        Você conhece essa história?
      </motion.h2>
      <div className="grid sm:grid-cols-2 gap-6">
        {pains.map((p, i) => <PainCard key={i} title={p.title} desc={p.desc} icon={p.icon} delay={i * 0.1} />)}
      </div>
    </section>
  );
};

const POSMockupAnim = () => {
  const [items, setItems] = useState([
    { name: 'Refrigerante Lata', price: 6 },
    { name: 'X-Tudo', price: 28 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => {
        if (prev.length >= 4) return [{ name: 'Refrigerante Lata', price: 6 }, { name: 'X-Tudo', price: 28 }];
        return [...prev, { name: 'Porção Batata', price: 22 }];
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const total = items.reduce((acc, curr) => acc + curr.price, 0);

  return (
    <div className="bg-bg-surface border border-border-main rounded-xl overflow-hidden w-full max-w-sm ml-auto mr-auto lg:mr-0 h-[380px] flex flex-col relative shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
      <div className="p-4 border-b border-border-main flex justify-between items-center">
        <span className="font-syne font-semibold">Mesa 12</span>
        <span className="font-mono text-xs text-text-muted">ABERTO</span>
      </div>
      <div className="flex-1 p-4 overflow-hidden flex flex-col gap-2 relative">
        <AnimatePresence initial={false}>
          {items.map((item, i) => (
            <motion.div 
              key={`${i}-${item.name}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="flex justify-between items-center border border-border-main bg-bg-elevated rounded p-3"
            >
              <span className="font-dm text-[var(--text-body)]">{item.name}</span>
              <span className="font-mono text-[var(--text-mono-sm)] text-text-muted">R$ {item.price},00</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="absolute bottom-4 right-4 animate-pulse">
           <button className="w-[44px] h-[44px] sm:w-12 sm:h-12 rounded-full bg-accent-amber text-bg-base flex items-center justify-center shadow-lg">
             <Plus size={20} className="stroke-[2.5px]" />
           </button>
        </div>
      </div>
      <div className="p-4 bg-bg-elevated border-t border-border-main">
        <div className="flex justify-between items-center text-lg">
          <span className="font-dm text-text-muted">Total</span>
          <span className="font-mono font-semibold text-accent-amber transition-all duration-300">
            R$ {total},00
          </span>
        </div>
      </div>
    </div>
  );
};

const POS = () => (
  <section className="py-24 px-6 max-w-[1200px] w-[min(100%-2.5rem,1200px)] mx-auto grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">
    <div>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-syne font-extrabold text-[var(--text-h2)] leading-[1.1] mb-6"
      >
        Cada segundo atrás<br/> do balcão conta.
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="font-dm text-text-muted text-[var(--text-body-lg)] leading-relaxed mb-10 max-w-md"
      >
        Interface touch-first desenhada para velocidade. Busca instantânea no catálogo, carrinho visual, gestão de pagamentos (à vista ou na ficha) e baixa automática de estoque — tudo em menos de 300ms por ação.
        <br/><br/>
        <strong className="text-text-primary font-medium">Sem delay. Sem bug. Sem fila.</strong>
      </motion.p>

      <div className="flex flex-wrap sm:flex-nowrap gap-6 sm:gap-8 border-t border-border-main pt-8">
         <div className="flex flex-col">
            <span className="font-mono text-xl text-accent-amber font-semibold mb-1">{'< 300ms'}</span>
            <span className="font-dm text-[11px] text-text-muted uppercase tracking-wider">por ação</span>
         </div>
         <div className="flex flex-col">
            <span className="font-mono text-xl text-text-primary font-semibold mb-1">Touch-first</span>
            <span className="font-dm text-[11px] text-text-muted uppercase tracking-wider">interface</span>
         </div>
         <div className="flex flex-col">
            <span className="font-mono text-xl text-text-primary font-semibold mb-1">Auto-sync</span>
            <span className="font-dm text-[11px] text-text-muted uppercase tracking-wider">de estoque</span>
         </div>
      </div>
    </div>
    <div className="relative">
      <POSMockupAnim />
    </div>
  </section>
);

const Fichas = () => {
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
    }, { threshold: 0.5 });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="fluxo" className="py-32 px-6 overflow-hidden max-w-[1200px] w-[min(100%-2.5rem,1200px)] mx-auto">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        
        {/* Visual Stack */}
        <div ref={containerRef} className="relative w-full max-w-[400px] h-[320px] mb-16 flex justify-center perspective-1000">
           {/* Back card */}
           <motion.div 
             animate={{
               rotate: inView ? -4 : -2,
               x: inView ? -20 : 0,
               y: inView ? 10 : 0,
             }}
             transition={{ duration: 0.8, ease: "easeInOut" }}
             className="absolute w-full border border-border-main bg-bg-elevated p-6 shadow-xl origin-bottom opacity-50"
             style={{ filter: 'brightness(0.6)' }}
           >
              <div className="h-40" />
           </motion.div>
           
           {/* Middle card */}
           <motion.div 
             animate={{
               rotate: inView ? 3 : 1,
               x: inView ? 20 : 0,
               y: inView ? 5 : 0,
             }}
             transition={{ duration: 0.8, ease: "easeInOut" }}
             className="absolute w-full border border-border-main bg-bg-surface p-6 shadow-2xl origin-bottom opacity-80"
             style={{ filter: 'brightness(0.8)' }}
           >
              <div className="h-40" />
           </motion.div>

           {/* Front card */}
           <motion.div 
             animate={{
               rotate: inView ? 0 : 0,
               y: inView ? -10 : 0,
             }}
             transition={{ duration: 0.8, ease: "easeInOut" }}
             className="absolute w-full border border-border-main bg-bg-surface p-6 shadow-2xl z-10 font-mono text-sm"
           >
             <div className="flex justify-between mb-4 text-text-primary">
               <span>João Silva</span>
               <span className="text-text-muted">Ficha #003</span>
             </div>
             <div className="text-border-main mb-4 overflow-hidden truncate">
               ────────────────────────────────────────
             </div>
             <div className="flex flex-col gap-2 text-text-muted">
               <div className="flex justify-between"><span>X-Burguer</span><span>R$ 18,00</span></div>
               <div className="flex justify-between"><span>Coca-Cola 600ml</span><span>R$  7,00</span></div>
               <div className="flex justify-between"><span>Batata Frita</span><span>R$ 12,00</span></div>
             </div>
             <div className="text-border-main my-4 overflow-hidden truncate">
               ────────────────────────────────────────
             </div>
             <div className="flex justify-between items-center text-accent-amber font-semibold">
               <span>TOTAL</span>
               <span className="flex items-center gap-2">
                 {inView && (
                   <motion.span 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-accent-green"
                   >
                     <Check size={16} strokeWidth={3} />
                   </motion.span>
                 )}
                 <span>{inView ? 'R$ 0,00' : 'R$ 37,00'}</span>
               </span>
             </div>
           </motion.div>
        </div>

        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-syne font-extrabold text-[var(--text-h2)] leading-[1.1] mb-6"
        >
          A ficha que nunca se perde.
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-dm text-[var(--text-body-lg)] text-text-muted max-w-2xl mb-10 leading-relaxed"
        >
          Abra uma conta por cliente. Adicione pedidos durante todo o dia. Na hora de ir embora, liquida tudo de uma vez — com valor exato, histórico completo e zero margem para dúvida.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3"
        >
           {['Sem papel', 'Sem divergência', 'Histórico completo'].map((pill, i) => (
             <span key={i} className="font-dm text-sm font-medium px-4 py-1.5 rounded-full border border-accent-amber/30 text-accent-amber bg-accent-amber/5">
                {pill}
             </span>
           ))}
        </motion.div>

      </div>
    </section>
  );
};

const TerminalAnim = () => {
   const lines = [
     { text: "$ caixafacil --fechar-dia", color: "text-text-primary" },
     { text: "> Calculando movimentações...", color: "text-text-muted", delay: 400 },
     { text: "RESUMO FINANCEIRO .... R$ 1.847,50", color: "text-accent-amber", delay: 900 },
     { text: "FICHAS LIQUIDADAS .... 12", color: "text-text-muted", delay: 1000 },
     { text: "FICHAS ABERTAS ....... 0", color: "text-text-muted", delay: 1100 },
     { text: "ITENS VENDIDOS ....... 87", color: "text-text-muted", delay: 1200 },
     { text: "PAGTOS À VISTA ....... R$ 1.340,00", color: "text-text-muted", delay: 1300 },
     { text: "PAGTOS VIA FICHA ..... R$   507,50", color: "text-text-muted", delay: 1400 },
     { text: "──────────────────────────────────", color: "text-border-main", delay: 1500 },
     { text: "STATUS ............... FECHADO ✓", color: "text-accent-green", delay: 1800 },
     { text: "DATA ................. 25-01-15 23:47", color: "text-text-muted", delay: 1900 },
   ];

   const [visibleLines, setVisibleLines] = useState<number>(0);
   const [started, setStarted] = useState(false);

   useEffect(() => {
     if(!started) return;
     let timeouts: NodeJS.Timeout[] = [];
     
     lines.forEach((line, index) => {
       timeouts.push(setTimeout(() => {
         setVisibleLines(index + 1);
       }, line.delay || (index * 80)));
     });

     return () => timeouts.forEach(clearTimeout);
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [started]);

   return (
     <motion.div 
       onViewportEnter={() => setStarted(true)}
       viewport={{ once: true, margin: "-100px" as any }}
       className="w-full max-w-lg bg-bg-surface border border-border-main rounded-lg shadow-2xl overflow-hidden font-mono text-[11px] sm:text-[13px] leading-relaxed"
     >
        {/* Terminal Header */}
        <div className="h-8 border-b border-border-main bg-bg-elevated flex items-center px-4 gap-2">
           <div className="w-2.5 h-2.5 rounded-full bg-accent-red" />
           <div className="w-2.5 h-2.5 rounded-full bg-accent-amber" />
           <div className="w-2.5 h-2.5 rounded-full bg-accent-green" />
        </div>
        {/* Terminal Body */}
        <div className="p-6 h-[320px]">
           {lines.slice(0, visibleLines).map((line, i) => (
             <div key={i} className={`${line.color} mb-1 whitespace-pre`}>
                {line.text}
             </div>
           ))}
           {started && <div className="terminal-cursor" />}
        </div>
     </motion.div>
   );
};

const Fechamento = () => (
  <section className="py-24 px-6 max-w-[1200px] w-[min(100%-2.5rem,1200px)] mx-auto grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">
    <div className="lg:order-2 flex flex-col justify-center">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-syne font-extrabold text-[var(--text-h2)] leading-[1.1] mb-6"
      >
        Fecha uma vez.<br/> Imutável. Sempre.
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="font-dm text-[var(--text-body-lg)] text-text-muted leading-relaxed mb-8 max-w-md"
      >
        Ao encerrar o dia, o sistema congela os dados e gera o relatório completo. Sem reabertura, sem edição retroativa, sem dúvida sobre o que realmente aconteceu.
      </motion.p>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="border-l-2 border-accent-amber pl-4"
      >
        <p className="font-dm italic text-text-primary text-[var(--text-body)]">"Uma operação por dia. Um relatório definitivo."</p>
      </motion.div>
    </div>
    
    <div className="lg:order-1 flex justify-center lg:justify-start w-full">
      <TerminalAnim />
    </div>
  </section>
);

const Estoque = () => {
   return (
     <section className="py-24 px-6 max-w-[1200px] w-[min(100%-2.5rem,1200px)] mx-auto">
        <ReceiptDivider />
        <div className="grid md:grid-cols-3 gap-10 md:gap-12 relative pt-8">
           <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay: 0}} className="pl-5 border-l-2 border-accent-amber">
              <h3 className="font-syne font-bold text-[var(--text-h3)] mb-3 text-text-primary">Entrada e Saída</h3>
              <p className="font-dm text-[var(--text-body)] text-text-muted leading-relaxed">Cada venda desconta automaticamente. Cada reposição manual fica registrada com timestamp e responsável.</p>
           </motion.div>

           <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay: 0.1}} className="relative pl-5 border-l-2 border-accent-amber">
              <h3 className="font-syne font-bold text-[var(--text-h3)] mb-3 text-text-primary">Bloqueio Automático</h3>
              <p className="font-dm text-[var(--text-body)] text-text-muted leading-relaxed relative z-10">Quando o estoque chega a zero, o item recebe o badge ESGOTADO e fica inacessível no PDV.</p>
              
              <motion.div 
                initial={{ opacity: 0, scale: 2, rotate: -15 }}
                whileInView={{ opacity: 1, scale: 1, rotate: -5 }}
                viewport={{ once: true, margin: "-50px" as any }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
                className="absolute -bottom-8 -right-4 sm:-right-8 border-2 border-accent-red bg-accent-red/10 text-accent-red font-mono font-bold text-[var(--text-mono-sm)] px-4 py-1 backdrop-blur-sm shadow-xl z-20 pointer-events-none"
              >
                 ESGOTADO
              </motion.div>
           </motion.div>

           <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay: 0.2}} className="pl-5 border-l-2 border-accent-amber">
              <h3 className="font-syne font-bold text-[var(--text-h3)] mb-3 text-text-primary">Auditoria Completa</h3>
              <p className="font-dm text-[var(--text-body)] text-text-muted leading-relaxed">Todo ajuste manual gera um log imutável. Nada some sem rastro. Nada muda sem registro.</p>
           </motion.div>
        </div>
     </section>
   );
};

const Seguranca = () => {
   const pillars = [
     { icon: Lock, title: "Níveis de Acesso", desc: "Operadores não acessam o que não devem ver. Permissões granulares por função." },
     { icon: Ticket, title: "Suporte Integrado", desc: "Sistema de chamados nativo no painel. Sem e-mail, sem WhatsApp. Tudo registrado dentro da plataforma." },
     { icon: Shield, title: "Dados Protegidos", desc: "Autenticação com níveis de segurança e logs de sessão auditados." },
   ];

   return (
     <section id="seguranca" className="py-24 bg-bg-surface/50 border-t border-border-main">
        <div className="max-w-[1200px] w-[min(100%-2.5rem,1200px)] mx-auto px-6">
           <div className="grid md:grid-cols-3 gap-10 md:gap-12">
              {pillars.map((p, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="pl-5 border-l-2 border-accent-amber"
                >
                   <p.icon size={24} className="text-text-muted mb-4" strokeWidth={1.5} />
                   <h4 className="font-syne font-bold text-[var(--text-h3)] mb-2">{p.title}</h4>
                   <p className="font-dm text-[var(--text-body)] text-text-muted leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
           </div>
        </div>
     </section>
   );
};

const CTA = () => {
  return (
    <section id="cta" className="pt-24 pb-32 bg-accent-amber text-bg-base overflow-hidden relative">
      <div className="w-full h-full absolute inset-0 opacity-[0.03] invert pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
      
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-syne font-extrabold text-[var(--text-hero)] leading-[1.05] mb-6"
        >
          Pronto pra colocar seu<br className="hidden sm:block"/> caixa em ordem?
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-dm text-[var(--text-body-lg)] font-medium mb-12"
        >
          Sem planilha. Sem papel. Sem improviso.
        </motion.p>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          onSubmit={(e) => { e.preventDefault(); alert("Enviado com sucesso!"); }}
          className="flex flex-col md:flex-row w-full max-w-2xl mx-auto gap-3"
        >
          <input 
            type="text" 
            required 
            placeholder="Nome do negócio" 
            className="flex-1 px-5 h-[52px] bg-bg-base/10 border border-bg-base/20 rounded-md placeholder:text-bg-base/60 text-bg-base font-dm outline-none focus:ring-2 focus:ring-bg-base/50 transition-all font-medium w-full"
          />
          <input 
            type="email" 
            required 
            placeholder="Seu e-mail" 
            className="flex-1 px-5 h-[52px] bg-bg-base/10 border border-bg-base/20 rounded-md placeholder:text-bg-base/60 text-bg-base font-dm outline-none focus:ring-2 focus:ring-bg-base/50 transition-all font-medium w-full"
          />
          <button 
            type="submit" 
            className="w-full md:w-auto px-6 h-[52px] bg-bg-base text-accent-amber font-dm font-semibold rounded-md hover:bg-[#1a1711] transition-colors whitespace-nowrap"
          >
            Quero acesso →
          </button>
        </motion.form>
        
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="font-dm font-light text-[13px] mt-6 opacity-80"
        >
          Sem compromisso. Sem cartão de crédito.
        </motion.p>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="bg-bg-base border-t border-border-main py-12 md:py-16">
    <div className="max-w-[1200px] w-[min(100%-2.5rem,1200px)] mx-auto grid md:grid-cols-3 gap-10 md:gap-12 mb-12 md:mb-16">
      <div>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="font-syne font-bold outline-none text-[var(--text-h3)] tracking-tight">
            Caixa<span className="text-accent-amber">Facil</span>
          </span>
        </div>
        <p className="font-dm text-[var(--text-body)] text-text-muted">Controle total do seu caixa.</p>
      </div>
      
      <div className="flex flex-col gap-3 font-dm text-[var(--text-body)] text-text-muted">
        <a href="#sobre" className="hover:text-text-primary transition-colors w-fit">Funcionalidades</a>
        <a href="#fluxo" className="hover:text-text-primary transition-colors w-fit">Como funciona</a>
        <a href="#seguranca" className="hover:text-text-primary transition-colors w-fit">Segurança</a>
        <a href="#cta" className="hover:text-text-primary transition-colors w-fit">Contato</a>
      </div>

      <div className="flex flex-col gap-2 font-mono text-[var(--text-mono-sm)] text-text-muted lg:items-end">
        <span>TypeScript · React · Vite</span>
        <span>Desenvolvido em Blumenau, SC 🇧🇷</span>
        <a href="https://github.com/Kevinnc1227/CaixaFacil_Alvorada" target="_blank" rel="noreferrer" className="hover:text-accent-amber transition-colors mt-2 underline underline-offset-4 decoration-border-main hover:decoration-accent-amber">
          github.com/Kevinnc1227/CaixaFacil_Alvorada
        </a>
      </div>
    </div>
    <div className="text-center font-dm text-[12px] text-text-muted opacity-60">
      © 2025 CaixaFacil — Todos os direitos reservados
    </div>
  </footer>
);

export default function App() {
  return (
    <>
      <CustomCursor />
      <ScrollProgress />
      <Navbar />
      
      <main>
        <Hero />
        <Credibility />
        <Pain />
        <ReceiptDivider />
        <POS />
        <ReceiptDivider />
        <Fichas />
        <ReceiptDivider />
        <Fechamento />
        <Estoque />
        <Seguranca />
        <CTA />
      </main>

      <Footer />
    </>
  );
}

