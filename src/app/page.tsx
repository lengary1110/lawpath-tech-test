import Image from "next/image";
import styles from "./page.module.css";
import AddressForm from "../app/components/AddressForm/AddressForm";

export default function Home() {
  return (
    <div className={styles.container}>
      <Image 
        src="/lawpath.png"
        alt="image"
        width={400}
        height={300}
        className={styles.image}
      />
      <div className={styles.form}>
        <AddressForm /> 
      </div>
    </div>
  );
}
