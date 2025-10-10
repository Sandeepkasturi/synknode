
import React from 'react';
import { Shield, Share2, Zap, Wifi, Globe, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export const InfoSection: React.FC = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        type: "spring",
        stiffness: 100,
      },
    }),
  };

  return (
    <div className="mt-24 space-y-10">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-3xl font-bold text-center mb-8 text-foreground"
      >
        Why Choose SynkNode?
      </motion.h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={cardVariants}
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all border border-border bg-card/80 backdrop-blur-sm relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <h3 className="text-xl font-semibold text-card-foreground mb-4 flex items-center gap-2 relative z-10">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="bg-primary rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
            >
              <Shield className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            Security Features
          </h3>
          <ul className="space-y-4 text-muted-foreground relative z-10">
            {[
              { icon: Lock, title: "End-to-End Encryption", desc: "Your files never pass through external servers" },
              { icon: Shield, title: "Permission Control", desc: "Explicit permission required for each transfer" },
              { icon: Wifi, title: "Direct Connection", desc: "Peer-to-peer transfer for enhanced privacy" }
            ].map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex items-start gap-3 group/item"
              >
                <item.icon className="w-5 h-5 text-primary mt-0.5 group-hover/item:scale-110 transition-transform" />
                <div>
                  <span className="font-medium block text-card-foreground">{item.title}</span>
                  <span className="text-sm">{item.desc}</span>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          custom={1}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={cardVariants}
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all border border-border bg-card/80 backdrop-blur-sm relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <h3 className="text-xl font-semibold text-card-foreground mb-4 flex items-center gap-2 relative z-10">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="bg-primary rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
            >
              <Zap className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            Advantages
          </h3>
          <ul className="space-y-4 text-muted-foreground relative z-10">
            {[
              { icon: Globe, title: "Cross-Network Sharing", desc: "Works across different networks and internet connections" },
              { icon: Share2, title: "No Size Limits", desc: "Transfer files of any size without restrictions" },
              { icon: Zap, title: "Blazing Fast", desc: "Direct connection provides maximum transfer speeds" }
            ].map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex items-start gap-3 group/item"
              >
                <item.icon className="w-5 h-5 text-primary mt-0.5 group-hover/item:scale-110 transition-transform" />
                <div>
                  <span className="font-medium block text-card-foreground">{item.title}</span>
                  <span className="text-sm">{item.desc}</span>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
      
      <div className="max-w-3xl mx-auto mt-16 bg-card rounded-xl p-6 border border-border">
        <h3 className="text-xl font-bold text-center text-card-foreground mb-4">How Cross-Network Sharing Works</h3>
        <div className="flex flex-col space-y-4">
          <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
            <div className="bg-primary/20 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-primary">1</span>
            </div>
            <div>
              <p className="text-muted-foreground">
                Files are shared through a cloud signaling server that helps establish the connection between peers.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
            <div className="bg-primary/20 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-primary">2</span>
            </div>
            <div>
              <p className="text-muted-foreground">
                Once connected, files transfer directly between devices with end-to-end encryption.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
            <div className="bg-primary/20 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-primary">3</span>
            </div>
            <div>
              <p className="text-muted-foreground">
                The process works even between different networks, carriers, and ISPs worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
