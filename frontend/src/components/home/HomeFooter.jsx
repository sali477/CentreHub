import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';

const FOOTER_LINKS = {
  Platform: [
    { to: '/centers', label: 'Centers' },
    { to: '/courses', label: 'Courses' },
    { to: '/ai', label: 'AI Chat' },
    { to: '/register', label: 'Get Started' },
  ],
  Company: [
    { to: '/#stats', label: 'About' },
    { to: '/login', label: 'Sign In' },
    { to: 'mailto:support@centrehub.ma', label: 'Contact', external: true },
  ],
};

const HomeFooter = () => (
  <footer className="border-t border-border bg-card">
    <div className="page-container py-12 lg:py-14">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="font-bold text-lg text-foreground">
            Centre<span className="text-primary">Hub</span>
          </p>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs leading-relaxed">
            Morocco&apos;s modern platform for discovering courses, centers, and expert teachers.
          </p>
          <div className="flex gap-3 mt-5">
            {[
              { icon: FiTwitter, href: '#' },
              { icon: FiLinkedin, href: '#' },
              { icon: FiGithub, href: '#' },
              { icon: FiMail, href: 'mailto:support@centrehub.ma' },
            ].map(({ icon: Icon, href }, i) => (
              <a
                key={i}
                href={href}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors"
                aria-label="Social link"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
          <div key={title}>
            <h4 className="font-semibold text-sm text-foreground mb-4">{title}</h4>
            <ul className="space-y-2.5">
              {links.map(({ to, label, external }) => (
                <li key={label}>
                  {external ? (
                    <a href={to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {label}
                    </a>
                  ) : (
                    <Link to={to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border mt-10 pt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} CentreHub Morocco. All rights reserved.
      </div>
    </div>
  </footer>
);

export default HomeFooter;
