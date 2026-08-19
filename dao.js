/**
 * IBOGAINE DAO — DAO Governance Interaction Module
 * File: js/dao.js
 * 
 * Features:
 * - Lists proposals from api/dao-proposals.php targeting #proposals-container & #governance
 * - Renders proposal status, title, description, category, requested amount, and vote progress bars (.vote-bar-fill)
 * - Validates Phantom/Solana wallet connection (window.walletPubkey()) before voting
 * - Validates minimum 100 GAINE token balance before voting
 * - Submits vote POST to api/dao-proposals.php?action=vote
 * - Binds proposal creation forms (#create-proposal-form and #proposal-form) posting to api/dao-proposals.php?action=create
 */

'use strict';

(function() {
  function getApiEndpoint() {
    return window.location.pathname.includes('/pages/') ? '../api/dao-proposals.php' : 'api/dao-proposals.php';
  }

  let proposalsCache = [];

  /**
   * Fetch proposal list from MySQL API
   */
  async function fetchProposals(status = 'all') {
    const container = document.getElementById('proposals-container') || document.getElementById('governance-proposals');
    if (!container) return;

    try {
      const endpoint = getApiEndpoint();
      const url = `${endpoint}?action=list${status !== 'all' ? '&status=' + status : ''}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      
      if (data && data.proposals && Array.isArray(data.proposals)) {
        proposalsCache = data.proposals;
        renderProposals(proposalsCache);
      }
    } catch (err) {
      console.warn('[DAO] Failed to fetch proposals from API, using DOM elements:', err.message);
      // If API fails or is unreachable, still ensure vote buttons in DOM are bound
      bindVoteButtons();
    }
  }

  /**
   * Render proposals into DOM container
   */
  function renderProposals(proposals) {
    const container = document.getElementById('proposals-container');
    if (!container) return;

    if (!proposals || proposals.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 3rem; text-align: center; color: var(--text-muted);">
          No active governance proposals found.
        </div>
      `;
      return;
    }

    const html = proposals.map(p => {
      const votesFor = parseInt(p.votes_for) || 0;
      const votesAgainst = parseInt(p.votes_against) || 0;
      const totalVotes = parseInt(p.total_votes) || (votesFor + votesAgainst);
      const approvalPct = totalVotes > 0 ? Math.round((votesFor / totalVotes) * 100) : (p.approval_pct || 0);

      const status = (p.status || 'active').toLowerCase();
      const isPassed = status === 'passed';
      const isActive = status === 'active' || status === 'pending';

      const statusBadge = isPassed ? 
        '<span class="badge" style="background: #3b82f6; color: #fff;">PASSED</span>' :
        '<span class="badge" style="background: #22c55e; color: #fff;">ACTIVE</span>';

      return `
        <div class="card fade-up visible" data-proposal-id="${p.id}" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
              <span class="badge" style="background: rgba(0, 242, 254, 0.1); color: var(--cyan-electric); font-weight: 700; border: 1px solid rgba(0, 242, 254, 0.2); padding: 0.25rem 0.5rem; border-radius: var(--r-pill);">PROPOSAL #${String(p.id).padStart(3, '0')}</span>
              ${statusBadge}
            </div>
            <h3 style="font-size: 1.25rem; margin-bottom: 0.75rem; color: var(--text-main);">${p.title}</h3>
            <p style="font-size: 0.9375rem; color: var(--text-muted); margin-bottom: 1.25rem; line-height: 1.6;">
              ${p.description}
            </p>
            <div style="display: flex; gap: 1.5rem; font-size: 0.875rem; color: var(--cyan-electric); font-weight: 600; margin-bottom: 1.25rem;">
              <div>Votes For: <strong>${votesFor.toLocaleString()}</strong></div>
              <div>Approval: <strong>${approvalPct}%</strong></div>
            </div>
          </div>
          <div>
            <!-- VOTE PROGRESS BAR -->
            <div style="margin-bottom: 1rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; margin-bottom: 0.375rem; font-weight: 600;">
                <span style="color: var(--cyan-electric);">For: ${votesFor} (${approvalPct}%)</span>
                <span style="color: var(--text-subtle);">Against: ${votesAgainst}</span>
              </div>
              <div class="vote-bar" style="height: 8px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden;">
                <div class="vote-bar-fill" style="width: ${approvalPct}%; height: 100%; background: ${isPassed ? '#3b82f6' : 'var(--cyan-electric)'}; border-radius: 4px; transition: width 0.6s ease;"></div>
              </div>
            </div>

            ${isActive ? `
              <div style="display: flex; gap: 0.75rem; margin-top: 1rem;">
                <button class="btn btn-primary btn-sm vote-btn" data-proposal-id="${p.id}" data-vote="for" style="flex: 1;">Vote For</button>
                <button class="btn btn-outline btn-sm vote-btn" data-proposal-id="${p.id}" data-vote="against" style="flex: 1;">Vote Against</button>
              </div>
            ` : `
              <div style="font-size: 0.875rem; color: #60a5fa; font-weight: 600; text-align: center; padding: 0.5rem; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: var(--r-sm); margin-top: 1rem;">
                ✓ Proposal Passed & Executed on Solana Mainnet
              </div>
            `}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
    bindVoteButtons();
  }

  /**
   * Helper to retrieve user's current GAINE balance from DOM or window state
   */
  function getUserGaineBalance() {
    if (typeof window.getGaineBalance === 'function') {
      return window.getGaineBalance();
    }

    const balanceEl = document.querySelector('.gaine-balance-display');
    if (balanceEl) {
      const text = balanceEl.textContent.replace(/[^0-9.]/g, '');
      const parsed = parseFloat(text);
      if (!isNaN(parsed)) return parsed;
    }

    if (window.walletState && typeof window.walletState.balance === 'number') {
      return window.walletState.balance;
    }

    return 0;
  }

  /**
   * Bind Voting Logic to Vote Buttons
   */
  function bindVoteButtons() {
    const buttons = document.querySelectorAll('.vote-btn, [data-vote]');
    buttons.forEach(btn => {
      // Remove any previously attached click handler to avoid duplicate bindings
      btn.onclick = null;
      btn.addEventListener('click', async (e) => {
        e.preventDefault();

        const proposalId = btn.dataset.proposalId || btn.dataset.id;
        const voteType = btn.dataset.vote || 'for';

        // 1. Check Solana Wallet Connection
        const pubkey = window.walletPubkey ? window.walletPubkey() : null;
        if (!pubkey) {
          window.showToast?.('Please connect your Solana wallet to cast a vote.', 'warn');
          if (typeof window.walletConnect === 'function') {
            window.walletConnect();
          }
          return;
        }

        // 2. Validate Minimum 100 GAINE Token Balance
        const balance = getUserGaineBalance();
        if (balance < 100) {
          window.showToast?.('Minimum 100 GAINE tokens required to vote on governance proposals.', 'error');
          return;
        }

        // 3. Submit Vote to PHP API
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Submitting...';

        try {
          const endpoint = getApiEndpoint();
          const res = await fetch(`${endpoint}?action=vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              proposal_id: parseInt(proposalId, 10),
              wallet_addr: pubkey,
              vote: voteType,
              gaine_balance: balance
            })
          });

          const data = await res.json();

          if (res.status === 200 && data.success) {
            window.showToast?.(`Vote recorded successfully on Proposal #${proposalId}!`, 'success');
            fetchProposals(); // Refresh proposal list and vote progress bars
          } else if (res.status === 409) {
            window.showToast?.(data.error || 'You have already voted on this proposal.', 'warn');
          } else if (res.status === 403) {
            window.showToast?.(data.error || 'Minimum 100 GAINE required to vote.', 'error');
          } else {
            window.showToast?.(data.error || 'Failed to submit vote.', 'error');
          }
        } catch (err) {
          console.error('[DAO] Error submitting vote:', err);
          window.showToast?.('Network error submitting vote.', 'error');
        } finally {
          btn.disabled = false;
          btn.textContent = originalText;
        }
      });
    });
  }

  /**
   * Bind Proposal Submission Form (#create-proposal-form and #proposal-form)
   */
  function initProposalForm() {
    const form = document.getElementById('create-proposal-form') || document.getElementById('proposal-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const pubkey = window.walletPubkey ? window.walletPubkey() : null;
      if (!pubkey) {
        window.showToast?.('Please connect your wallet to create a proposal.', 'warn');
        if (typeof window.walletConnect === 'function') {
          window.walletConnect();
        }
        return;
      }

      const titleEl = document.getElementById('prop-title') || document.getElementById('proposal-title');
      const descEl = document.getElementById('prop-desc') || document.getElementById('proposal-desc');
      const categoryEl = document.getElementById('prop-category');
      const allocEl = document.getElementById('prop-allocation');

      const title = titleEl ? titleEl.value.trim() : '';
      const description = descEl ? descEl.value.trim() : '';
      const category = categoryEl ? categoryEl.value : 'Clinical Grant';
      const requestedAmount = allocEl ? allocEl.value : '0';

      if (!title || title.length < 5) {
        window.showToast?.('Proposal title must be at least 5 characters.', 'warn');
        return;
      }

      if (!description || description.length < 20) {
        window.showToast?.('Proposal description must be at least 20 characters.', 'warn');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting Proposal...';
      }

      try {
        const endpoint = getApiEndpoint();
        const res = await fetch(`${endpoint}?action=create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            category,
            requested_amount: requestedAmount,
            creator_wallet: pubkey
          })
        });

        const data = await res.json();

        if (data && data.success) {
          window.showToast?.('Proposal created successfully! Submitted for community voting.', 'success');
          form.reset();
          fetchProposals();
        } else {
          window.showToast?.(data.error || 'Failed to create proposal.', 'error');
        }
      } catch (err) {
        console.error('[DAO] Create proposal error:', err);
        window.showToast?.('Error connecting to proposal creation endpoint.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Proposal to DAO';
        }
      }
    });
  }

  /**
   * Bind Connect to Vote Callout Button
   */
  function initConnectCallouts() {
    const btn = document.getElementById('connect-to-vote');
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (typeof window.walletConnect === 'function') {
        window.walletConnect();
      }
    });
  }

  // Auto-init on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    fetchProposals();
    bindVoteButtons();
    initProposalForm();
    initConnectCallouts();
  });

  // Global API exposure
  window.daoGovernance = {
    fetchProposals,
    renderProposals,
    bindVoteButtons
  };
  window.initDAOProposals = fetchProposals;
})();
