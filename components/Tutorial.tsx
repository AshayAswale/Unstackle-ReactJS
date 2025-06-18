export default function HowToPlay() {
  return (
    <div className="p-6 max-w-3xl mx-auto bg-white text-black">
      <h1 className="text-4xl font-bold mb-6 text-center">How to Play UNSTACKLE</h1>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Goal</h2>
        <p>Clear the entire grid in as few turns as possible. The fewer turns you take, the better you score!</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">The Grid</h2>
        <p>
          - The grid is a 4x4 board filled with boxes containing numbers from 1 to 4.<br/>
          - Each number represents the weight of that box.<br/>
          - You have a carrying capacity of <strong>6 units</strong> at a time.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">How to Remove Boxes</h2>

        {/* <h3 className="text-xl font-semibold mt-4"> Simple Single Click</h3>
        <p>
          - Click on any <strong>TOP BOX</strong> (a box with no box above it) to remove it.<br/>
          - Each removal counts as one turn.
        </p> */}

        <h3 className="text-xl font-semibold mt-4">1️⃣ Backlog Mode</h3>
        <p>
          - To remove multiple boxes together, you can build a <strong>BACKLOG</strong>:
          <ul className="list-disc list-inside">
            <li>Click any <strong>TOP BOX</strong> (a box with no box above it) to initialize a backlog.</li>
            <li>Click on other boxes to add them to the backlog, following these rules:</li>
            <ul className="list-disc list-inside ml-6">
              <li>New boxes must be direct neighbors (up, down, left, right) of existing backlog boxes.</li>
              <li>If a box is not on top, its immediate above box must already be in the backlog.</li>
              <li>The total weight of all backlog boxes cannot exceed your 6-unit capacity.</li>
              <li>The current weight is shown as <strong>"Total"</strong> after the Backlog information</li>
            </ul>
            <li>Backlog boxes will turn yellow as they are selected.</li>
          </ul>
        </p>

        <h3 className="text-xl font-semibold mt-4">2️⃣ Execute Backlog</h3>
        <p>
          - Click any backlog box again to execute the backlog and remove all selected boxes together.<br/>
          - Executing backlog <strong>consumes one turn</strong>.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Controls</h2>
        <ul className="list-disc list-inside">
          <li><span className="font-bold">Reset</span>: Reset the grid to the initial state.</li>
          <li><span className="font-bold">Reset Backlog</span>: Clear current backlog selection.</li>
          <li><span className="font-bold">New Game</span>: Start a new random puzzle.</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Winning Condition</h2>
        <p>
        <ul className="list-disc list-inside">
          <li>The game calculates the <strong>optimal number of moves</strong> using a solver. This number is shown as <strong>"Challenge"</strong>. </li>
          <li>You win if you clear the grid in that many turns or fewer!</li>
        </ul>
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Tips</h2>
        <ul className="list-disc list-inside">
          <li>Always try to maximize backlog to remove more boxes in fewer turns.</li>
          <li>Plan which boxes will become exposed after each removal.</li>
          <li>Be mindful of your 6-unit capacity limit.</li>
          <li>Invalid selections will shake the box to indicate illegal moves.</li>
        </ul>
      </section>

      <div className="text-center mt-8">
        <a href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-semibold transition">Back to Game</a>
      </div>
    </div>
  );
}
