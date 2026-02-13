function Footer() {
  return (
    <footer className="text-center text-lg-start mt-auto">
      <div className="footer text-center p-4 text-body-secondary">
        &copy; {new Date().getFullYear()} BleatBook. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
