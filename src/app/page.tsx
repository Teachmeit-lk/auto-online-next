"use client";

import { FC } from "react";
import { AddProductModal } from "./modal/AddProductModal";

const Home: FC = () => {
  return <AddProductModal isOpen={true} onClose={() => {}} />;
};

export default Home;
