import React from 'react';
import { motion, type PanInfo, useMotionValue, useTransform } from 'framer-motion';

interface SwipeCardProps {
  user: {
    id: string;
    name: string;
    bio: string;
    image: string;
  };
  onSwipe: (direction: 'left' | 'right') => void;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ user, onSwipe }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className="absolute w-80 h-[500px] bg-white rounded-3xl shadow-xl cursor-grab active:cursor-grabbing overflow-hidden"
    >
      <img src={user.image} alt={user.name} className="w-full h-3/4 object-cover" />
      <div className="p-6 text-black">
        <h2 className="text-2xl font-bold">{user.name}</h2>
        <p className="text-gray-600 mt-2">{user.bio}</p>
      </div>
    </motion.div>
  );
};

export default SwipeCard;