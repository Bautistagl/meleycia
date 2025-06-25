import styles from './Contact.module.css'

export default function Contact() {
  return (
    <section className={styles.contactSection}>
      <div className={styles.container}>
        <div className={styles.contactInfo}>
          <h2 className={styles.title}>Contáctanos</h2>
          <p className={styles.text}>Estamos aquí para responder tus preguntas y ayudarte con tus necesidades comerciales.</p>
          <p className={styles.text}>Email: info@meleycia.com</p>
          <p className={styles.text}>Teléfono: +54 11 1234-5678</p>
          <p className={styles.text}>Dirección: Av. Principal 1234, Buenos Aires</p>
        </div>
        <form className={styles.form} >
          <input className={styles.input} type="text" placeholder="Nombre" />
          <input className={styles.input} type="email" placeholder="Email" />
          <textarea className={styles.textarea} placeholder="Mensaje"></textarea>
          <button className={styles.submitButton} type="submit">Enviar Mensaje</button>
        </form>
      </div>
    </section>
  )
}

