
import "./ProjectCatalog.css";
import JleyLogo from "../components/JleyLogo";

const projects = [
    {
        id: "jley-xmd",
        name: "JLEY-XMD",
        category: "WhatsApp Automation",
        description: "Deploy and manage your WhatsApp bot with QR or pairing-code access.",
        icon: "⚡",
        status: "Available",
        statusType: "available",
        action: "Open project",
    },
    {
        id: "nexa-bot",
        name: "NEXA BOT",
        category: "WhatsApp Automation",
        description: "A new WhatsApp bot experience is on the way.",
        icon: "💬",
        status: "Coming soon",
        statusType: "upcoming",
        action: "Coming soon",
    },
    {
        id: "nexa-ai",
        name: "NEXA AI",
        category: "Artificial Intelligence",
        description: "Discover AI-powered tools when NEXA AI launches.",
        icon: "✦",
        status: "Coming soon",
        statusType: "upcoming",
        action: "Coming soon",
    },
    {
        id: "jley-vcf",
        name: "JLEY VCF",
        category: "Contact Utilities",
        description: "Simple tools for working with VCF contact files.",
        icon: "▤",
        status: "Coming soon",
        statusType: "upcoming",
        action: "Coming soon",
    },
];

export default function ProjectCatalog({ onLogin, onRegister, onExplore }) {
    function exploreProject(project) {
        if (project.id === "jley-xmd" && onExplore) {
            onExplore(project.id);
        }
    }

    return (
        <main className="catalog-page">
            <header className="catalog-nav">
                <a className="catalog-brand" href="#home" aria-label="JLEY Platform home">
    <JleyLogo size={42} />
    <span>
        JLEY<span className="brand-accent">.</span>
        <small>PROJECTS PLATFORM</small>
    </span>
</a>

                <nav className="catalog-nav-links" aria-label="Main navigation">
                    <a href="#projects">Projects</a>
                    <a href="#how-it-works">How it works</a>
                </nav>

                <div className="catalog-nav-actions">
                    <button type="button" className="catalog-login-button" onClick={onLogin}>
                        Log in
                    </button>
                    <button
                        type="button"
                        className="catalog-primary-button catalog-nav-cta"
                        onClick={onRegister}
                    >
                        Create account <span aria-hidden="true">↗</span>
                    </button>
                </div>
            </header>

            <section className="catalog-hero" id="home">
                <div className="catalog-hero-copy">
                    <div className="catalog-eyebrow">
                        <span className="catalog-live-dot" />
                        ONE PLATFORM. MORE POSSIBILITIES.
                    </div>

                    <h1>
                        Your tools.
                        <br />
                        <span>All in one place.</span>
                    </h1>

                    <p className="catalog-hero-description">
                        Bots, AI, and useful tools — all connected through one platform.
                    </p>

                    <div className="catalog-hero-actions">
                        <a className="catalog-primary-button" href="#projects">
                            Explore projects <span aria-hidden="true">↓</span>
                        </a>
                        <button
                            type="button"
                            className="catalog-secondary-button"
                            onClick={onRegister}
                        >
                            Get started
                        </button>
                    </div>

                    <div className="catalog-trust-note">
                        <span aria-hidden="true">✓</span>
                        One account. Multiple projects.
                    </div>
                </div>

                <div className="catalog-hero-visual" aria-label="Projects on the platform">
                    <div className="catalog-orbit catalog-orbit-one" />
                    <div className="catalog-orbit catalog-orbit-two" />

                    
<div className="catalog-visual-core">
    <JleyLogo size={76} />
    <span>YOUR WORKSPACE</span>
</div>


                    <div className="catalog-floating-card catalog-float-top">
                        <span className="catalog-mini-icon blue">⚡</span>
                        <span>
                            <strong>JLEY-XMD</strong>
                            <small>WhatsApp automation</small>
                        </span>
                        <span className="catalog-card-check">✓</span>
                    </div>

                    <div className="catalog-floating-card catalog-float-left">
                        <span className="catalog-mini-icon purple">✦</span>
                        <span>
                            <strong>NEXA AI</strong>
                            <small>AI tools</small>
                        </span>
                    </div>

                    <div className="catalog-floating-card catalog-float-right">
                        <span className="catalog-mini-icon green">💬</span>
                        <span>
                            <strong>NEXA BOT</strong>
                            <small>WhatsApp bot</small>
                        </span>
                    </div>

                    <div className="catalog-visual-caption">
                        One home for your projects
                    </div>
                </div>
            </section>

            <section className="catalog-projects" id="projects">
                <div className="catalog-section-heading">
                    <div>
                        <div className="catalog-section-eyebrow">EXPLORE THE PLATFORM</div>
                        <h2>Pick your next project.</h2>
                        <p>Find the tool you need.</p>
                    </div>
                    <span className="catalog-project-count">
                        {projects.length} projects
                    </span>
                </div>

                <div className="catalog-project-grid">
                    {projects.map((project) => (
                        <article className="catalog-project-card" key={project.id}>
                            <div className="catalog-project-card-top">
                                <div
                                    className={`catalog-project-icon ${project.id}`}
                                    aria-hidden="true"
                                >
                                    {project.icon}
                                </div>
                                <span className={`catalog-status ${project.statusType}`}>
                                    <span />
                                    {project.status}
                                </span>
                            </div>

                            <div className="catalog-project-category">
                                {project.category}
                            </div>

                            <h3>{project.name}</h3>
                            <p className="catalog-project-description">
                                {project.description}
                            </p>

                            <button
                                type="button"
                                className={
                                    project.statusType === "available"
                                        ? "catalog-project-action available"
                                        : "catalog-project-action disabled"
                                }
                                disabled={project.statusType !== "available"}
                                onClick={() => exploreProject(project)}
                            >
                                {project.action}
                                {project.statusType === "available" && (
                                    <span aria-hidden="true">→</span>
                                )}
                            </button>
                        </article>
                    ))}

                    <article className="catalog-future-card">
                        <div className="catalog-future-icon">＋</div>
                        <h3>More is coming.</h3>
                        <p>New projects. New possibilities.</p>
                    </article>
                </div>
            </section>

            <section className="catalog-how-it-works" id="how-it-works">
                <div className="catalog-how-heading">
                    <div className="catalog-section-eyebrow">GET STARTED</div>
                    <h2>Three steps. That's it.</h2>
                    <p>Your next tool is just a few steps away.</p>
                </div>

                <div className="catalog-steps">
                    <article className="catalog-step">
                        <span className="catalog-step-number">01</span>
                        <div className="catalog-step-icon">⌕</div>
                        <h3>Explore</h3>
                        <p>Find a project that fits your needs.</p>
                    </article>

                    <article className="catalog-step">
                        <span className="catalog-step-number">02</span>
                        <div className="catalog-step-icon">↗</div>
                        <h3>Join</h3>
                        <p>Create your free platform account.</p>
                    </article>

                    <article className="catalog-step">
                        <span className="catalog-step-number">03</span>
                        <div className="catalog-step-icon">✓</div>
                        <h3>Launch</h3>
                        <p>Start using the projects available to you.</p>
                    </article>
                </div>
            </section>

            <section className="catalog-bottom-cta">
                <div>
                    <div className="catalog-section-eyebrow">READY TO BEGIN?</div>
                    <h2>Let's build something.</h2>
                    <p>Your next project starts here.</p>
                </div>

                <button
                    type="button"
                    className="catalog-primary-button"
                    onClick={onRegister}
                >
                    Create your account <span aria-hidden="true">↗</span>
                </button>
            </section>

            <footer className="catalog-footer">
                <a className="catalog-footer-brand" href="#home">
                    JLEY<span>.</span> Platform
                </a>

                <p>Bots, AI, and tools. One home.</p>

                <div className="catalog-footer-bottom">
                    <span>© {new Date().getFullYear()} JLEY Platform</span>
                    <span>Founded by Javans bradley</span>
                </div>
            </footer>
        </main>
    );
}
