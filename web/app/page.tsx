import Link from "next/link";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center">
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-moonlight mb-6">
              Find <span className="text-gold">Clarity</span> in Your Thoughts
            </h1>
            <p className="text-xl md:text-2xl text-moonlight-dim mb-8 max-w-3xl mx-auto">
              Islamic reflection that helps you overcome distressing thoughts
              with wisdom from faith and science.
            </p>
            <Link
              href="/reflect"
              className="inline-block px-8 py-4 bg-gold text-background font-semibold rounded-xl hover:bg-gold-light transition-colors text-lg"
            >
              Start Your First Reflection
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-background-card py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-4xl font-bold text-center mb-16">
              How <span className="text-gold">Qamar</span> Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-background-card-light p-8 rounded-xl">
                <div className="text-gold text-4xl mb-4">1</div>
                <h3 className="font-serif text-2xl font-semibold mb-3">
                  Share Your Thought
                </h3>
                <p className="text-moonlight-dim">
                  Express what's troubling you in a safe, private space. Your
                  companion helps you reflect on patterns in your thinking.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-background-card-light p-8 rounded-xl">
                <div className="text-gold text-4xl mb-4">2</div>
                <h3 className="font-serif text-2xl font-semibold mb-3">
                  Gain Islamic Perspective
                </h3>
                <p className="text-moonlight-dim">
                  Receive reframes grounded in Quranic wisdom and Islamic
                  principles to shift your mindset.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-background-card-light p-8 rounded-xl">
                <div className="text-gold text-4xl mb-4">3</div>
                <h3 className="font-serif text-2xl font-semibold mb-3">
                  Set Your Intention
                </h3>
                <p className="text-moonlight-dim">
                  Create a niyyah (intention) to move forward with clarity and
                  purpose.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Crisis Support Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="bg-indigo p-8 md:p-12 rounded-2xl">
            <h2 className="font-serif text-3xl font-bold mb-4">
              Crisis Support Available
            </h2>
            <p className="text-moonlight-dim mb-6 text-lg">
              If you're in crisis, Qamar detects urgent needs and provides
              immediate resources, including 988 Suicide & Crisis Lifeline.
            </p>
            <p className="text-moonlight-muted text-sm">
              Qamar is not a replacement for professional care. Always consult qualified professionals for serious concerns.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-background-card py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="font-serif text-4xl font-bold mb-6">
              Ready to Begin Your Journey?
            </h2>
            <p className="text-xl text-moonlight-dim mb-8">
              Join thousands finding peace through Islamic reflection
            </p>
            <Link
              href="/reflect"
              className="inline-block px-8 py-4 bg-gold text-background font-semibold rounded-xl hover:bg-gold-light transition-colors text-lg"
            >
              Start Reflecting Now
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
