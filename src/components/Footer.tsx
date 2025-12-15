import React from 'react';
import { motion } from 'motion/react';
import { Github, Twitter, Instagram, Mail, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Mail, href: '#', label: 'Email' },
  ];

  const footerLinks = [
    {
      title: 'Company',
      links: ['About', 'Careers', 'Press', 'News']
    },
    {
      title: 'Support',
      links: ['Contact', 'FAQ', 'Help Center', 'Shipping']
    },
    {
      title: 'Legal',
      links: ['Privacy', 'Terms', 'Returns', 'Warranty']
    }
  ];

  return (
    <footer className="border-t border-white/10 bg-background/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 mb-4"
            >
              <Zap className="h-8 w-8 neon-text-cyan" />
              <span className="text-xl tracking-tight">FutureLab</span>
            </motion.div>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Shop like it's the future ⚡
            </p>
            <p className="text-sm text-muted-foreground">
              Discover cutting-edge products that redefine tomorrow's lifestyle.
            </p>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: (index + 1) * 0.1 }}
              className="col-span-1"
            >
              <h3 className="mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link}>
                    <motion.a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors relative group"
                      whileHover={{ x: 5 }}
                    >
                      {link}
                      <motion.div
                        className="absolute left-0 -bottom-1 w-0 h-px bg-gradient-to-r from-cyan-400 to-purple-400 group-hover:w-full"
                        transition={{ duration: 0.3 }}
                      />
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col md:flex-row items-center justify-between pt-8 mt-8 border-t border-white/10"
        >
          {/* Copyright */}
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            © 2024 FutureLab. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors hover:bg-white/5"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  aria-label={social.label}
                >
                  <Icon className="h-5 w-5" />
                </motion.a>
              );
            })}
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8"
        >
          <p className="text-sm neon-text-cyan tracking-wide">
            "Where innovation meets imagination"
          </p>
        </motion.div>
      </div>
    </footer>
  );
};